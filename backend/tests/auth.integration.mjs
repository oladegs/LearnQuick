// Verifies local authentication, password recovery, Google linking, and
// shared cookie sessions. Synthetic users are always removed.
import "dotenv/config";
import crypto from "node:crypto";
import mongoose from "mongoose";

import User from "../models/User.js";
import { generateAuthToken } from "../utils/authTokens.js";
import { findOrCreateGoogleUser } from "../utils/oauthService.js";

const baseUrl = process.env.AUTH_TEST_BASE_URL || "http://localhost:8000";
const stamp = Date.now().toString();
const localEmail = `local${stamp}@example.com`;
const googleEmail = `google${stamp}@example.com`;
const username = `learner${stamp.slice(-8)}`;
const firstPassword = "TestPass123!";
const resetPasswordValue = "ResetPass456!";
const changedPassword = "ChangedPass789!";
const googleAddedPassword = "GooglePass123!";

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  let body;
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  return {
    status: response.status,
    body,
    cookie: response.headers.get("set-cookie"),
  };
};

const postJson = (path, body = {}, cookie) =>
  request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required to run the auth integration test.");
}

await mongoose.connect(process.env.MONGODB_URI);

try {
  const providers = await request("/api/auth/providers");
  assert(providers.status === 200, "Provider status endpoint failed.");
  assert(
    Object.keys(providers.body.data).join(",") === "google",
    "A non-Google social provider is exposed.",
  );
  assert(
    (await request("/api/auth/microsoft")).status === 404 &&
      (await request("/api/auth/apple")).status === 404,
    "Microsoft or Apple is still exposed.",
  );

  const registered = await postJson("/api/auth/register", {
    username,
    email: localEmail,
    password: firstPassword,
  });
  assert(registered.status === 201, "Email registration failed.");
  assert(
    registered.body.data.user.authProviders.includes("password"),
    "The password provider was not recorded.",
  );
  assert(
    registered.cookie?.includes("HttpOnly"),
    "Registration did not set an HttpOnly session cookie.",
  );

  const registeredCookie = registered.cookie.split(";")[0];
  const session = await request("/api/auth/session", {
    headers: { cookie: registeredCookie },
  });
  assert(session.status === 200, "Cookie session validation failed.");

  const logout = await postJson("/api/auth/logout", {}, registeredCookie);
  assert(
    logout.status === 200 && logout.cookie?.startsWith("learnquick_session=;"),
    "Logout did not clear the session cookie.",
  );

  let unverifiedBlocked = false;
  try {
    await findOrCreateGoogleUser({
      providerId: `google-unverified-${stamp}`,
      email: localEmail,
      emailVerified: false,
      name: username,
    });
  } catch (error) {
    unverifiedBlocked = error.oauthCode === "unverified_google_email";
  }
  assert(unverifiedBlocked, "An unverified Google email was linked.");

  const linked = await findOrCreateGoogleUser({
    providerId: `google-linked-${stamp}`,
    email: localEmail,
    emailVerified: true,
    name: username,
  });
  assert(
    linked.authProviders.includes("password") &&
      linked.authProviders.includes("google"),
    "Google did not link alongside the existing password method.",
  );

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  await User.updateOne(
    { email: localEmail },
    {
      $set: {
        passwordResetToken: resetHash,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    },
  );

  const reset = await postJson(`/api/auth/reset-password/${resetToken}`, {
    password: resetPasswordValue,
  });
  assert(reset.status === 200, "Password reset failed.");
  assert(
    (await postJson("/api/auth/login", {
      email: localEmail,
      password: firstPassword,
    })).status === 401,
    "The old password still works after reset.",
  );

  const resetLogin = await postJson("/api/auth/login", {
    email: localEmail,
    password: resetPasswordValue,
  });
  assert(resetLogin.status === 200, "Login with the reset password failed.");

  const change = await postJson(
    "/api/auth/change-password",
    {
      currentPassword: resetPasswordValue,
      newPassword: changedPassword,
    },
    resetLogin.cookie.split(";")[0],
  );
  assert(change.status === 200, "Authenticated password change failed.");
  assert(
    (await postJson("/api/auth/login", {
      email: localEmail,
      password: changedPassword,
    })).status === 200,
    "Login with the changed password failed.",
  );

  const googleUser = await findOrCreateGoogleUser({
    providerId: `google-new-${stamp}`,
    email: googleEmail,
    emailVerified: true,
    name: "Google Learner",
  });
  const googleToken = generateAuthToken(googleUser._id);
  const addPassword = await postJson(
    "/api/auth/change-password",
    { newPassword: googleAddedPassword },
    `learnquick_session=${googleToken}`,
  );
  assert(addPassword.status === 200, "Google user could not add a password.");
  assert(
    addPassword.body.data.user.authProviders.includes("google") &&
      addPassword.body.data.user.authProviders.includes("password"),
    "Both authentication methods were not retained.",
  );
  assert(
    (await postJson("/api/auth/login", {
      email: googleEmail,
      password: googleAddedPassword,
    })).status === 200,
    "Google user could not use the newly added email/password login.",
  );

  console.log(
    JSON.stringify(
      {
        emailRegistration: "pass",
        emailLogin: "pass",
        passwordReset: "pass",
        passwordChange: "pass",
        googleAddition: "pass",
        safeAccountLinking: "pass",
        googleUserAddedPassword: "pass",
        microsoftAndAppleRemoved: "pass",
        cookieSessionAndLogout: "pass",
      },
      null,
      2,
    ),
  );
} finally {
  await User.deleteMany({ email: { $in: [localEmail, googleEmail] } });
  await mongoose.disconnect();
}
