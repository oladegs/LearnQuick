// Implements Google OAuth 2.0/OpenID Connect. Google tokens are verified for
// identity and are never stored by LearnQuick.
import * as oidc from "openid-client";

import User from "../models/User.js";

let googleConfiguration;

const getBackendUrl = () =>
  (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

const getGoogleDefinition = () => ({
  id: "google",
  label: "Google",
  issuer: new URL("https://accounts.google.com"),
  clientId: process.env.GOOGLE_CLIENT_ID?.trim(),
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scope: "openid email profile",
  idField: "googleId",
});

const isGoogleConfigured = (google) =>
  Boolean(google.clientId && google.clientSecret);

export const getOAuthProviderStatus = () => ({
  google: isGoogleConfigured(getGoogleDefinition()),
});

export const getGoogleProvider = () => {
  const google = getGoogleDefinition();

  if (!isGoogleConfigured(google)) {
    const error = new Error("Google authentication is not configured yet.");
    error.statusCode = 503;
    error.oauthCode = "provider_not_configured";
    throw error;
  }

  return {
    ...google,
    callbackUrl: `${getBackendUrl()}/api/auth/google/callback`,
  };
};

const getOidcConfiguration = async (google) => {
  if (googleConfiguration) return googleConfiguration;

  googleConfiguration = await oidc.discovery(
    google.issuer,
    google.clientId,
    {
      client_secret: google.clientSecret,
      redirect_uris: [google.callbackUrl],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
    },
    undefined,
    { timeout: 15 },
  );

  return googleConfiguration;
};

export const createAuthorizationRequest = async () => {
  const google = getGoogleProvider();
  const configuration = await getOidcConfiguration(google);
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();

  return {
    authorizationUrl: oidc.buildAuthorizationUrl(configuration, {
      redirect_uri: google.callbackUrl,
      scope: google.scope,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    }),
    transaction: {
      state,
      nonce,
      codeVerifier,
      createdAt: Date.now(),
    },
  };
};

const claimIsTrue = (claim) => claim === true || claim === "true";

export const exchangeAuthorizationCode = async ({
  callbackUrl,
  transaction,
}) => {
  const google = getGoogleProvider();
  const configuration = await getOidcConfiguration(google);
  const tokens = await oidc.authorizationCodeGrant(
    configuration,
    callbackUrl,
    {
      pkceCodeVerifier: transaction.codeVerifier,
      expectedState: transaction.state,
      expectedNonce: transaction.nonce,
      idTokenExpected: true,
    },
  );
  const claims = tokens.claims();

  if (!claims?.sub) {
    const error = new Error(
      "Google did not return a verifiable user identity.",
    );
    error.statusCode = 401;
    error.oauthCode = "invalid_identity";
    throw error;
  }

  return {
    providerId: String(claims.sub),
    email: String(claims.email || "").trim().toLowerCase(),
    emailVerified: claimIsTrue(claims.email_verified),
    name:
      String(claims.name || "").trim() ||
      String(claims.email || "").split("@")[0],
    profileImage:
      typeof claims.picture === "string" ? claims.picture : undefined,
  };
};

const createUniqueUsername = async (name, email) => {
  const base = String(name || email.split("@")[0] || "learner")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
  const safeBase = base.length >= 3 ? base : `learner${base}`;
  let candidate = safeBase;
  let suffix = 0;

  while (await User.exists({ username: candidate })) {
    suffix += 1;
    candidate = `${safeBase.slice(0, 24)}${suffix}`;
  }

  return candidate;
};

export const findOrCreateGoogleUser = async (identity) => {
  if (!identity.providerId) {
    const error = new Error("The Google account identifier is missing.");
    error.statusCode = 422;
    error.oauthCode = "missing_provider_id";
    throw error;
  }

  if (!identity.email) {
    const error = new Error(
      "Google did not provide an email address. Allow email access and try again.",
    );
    error.statusCode = 422;
    error.oauthCode = "missing_email";
    throw error;
  }

  if (!identity.emailVerified) {
    const error = new Error(
      "LearnQuick requires a Google-verified email address.",
    );
    error.statusCode = 409;
    error.oauthCode = "unverified_google_email";
    throw error;
  }

  let user = await User.findOne({ googleId: identity.providerId }).select(
    "+googleId",
  );

  if (user) {
    user.emailVerified = true;
    user.authProviders = user.authProviders || [];
    if (!user.authProviders.includes("google")) {
      user.authProviders.push("google");
    }
    if (!user.profileImage && identity.profileImage) {
      user.profileImage = identity.profileImage;
    }
    await user.save();
    return user;
  }

  user = await User.findOne({ email: identity.email }).select("+googleId");

  if (user) {
    if (user.googleId && user.googleId !== identity.providerId) {
      const error = new Error(
        "This email is already linked to a different Google account.",
      );
      error.statusCode = 409;
      error.oauthCode = "provider_already_linked";
      throw error;
    }

    user.googleId = identity.providerId;
    user.authProviders = user.authProviders || [];
    if (!user.authProviders.includes("google")) {
      user.authProviders.push("google");
    }
    user.emailVerified = true;
    if (!user.profileImage && identity.profileImage) {
      user.profileImage = identity.profileImage;
    }
    await user.save();
    return user;
  }

  const username = await createUniqueUsername(identity.name, identity.email);

  return User.create({
    username,
    email: identity.email,
    emailVerified: true,
    profileImage: identity.profileImage,
    authProviders: ["google"],
    googleId: identity.providerId,
  });
};
