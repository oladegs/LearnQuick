// Creates LearnQuick JWTs and manages the HttpOnly session cookie used by
// OAuth logins. Existing Authorization: Bearer tokens remain supported.
import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "learnquick_session";

const isProduction = () => process.env.NODE_ENV === "production";

const getSameSite = () => {
  const configured = process.env.COOKIE_SAME_SITE?.toLowerCase();
  return ["lax", "strict", "none"].includes(configured)
    ? configured
    : "lax";
};

const getCookieBaseOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: getSameSite(),
  path: "/",
  ...(process.env.COOKIE_DOMAIN
    ? { domain: process.env.COOKIE_DOMAIN }
    : {}),
});

export const generateAuthToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

export const setAuthCookie = (res, token) => {
  const days = Number.parseInt(process.env.AUTH_COOKIE_DAYS || "7", 10);

  res.cookie(AUTH_COOKIE_NAME, token, {
    ...getCookieBaseOptions(),
    maxAge: (Number.isFinite(days) ? days : 7) * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getCookieBaseOptions());
};

export const toPublicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  profileImage: user.profileImage,
  authProviders: (user.authProviders || []).filter((provider) =>
    ["password", "google"].includes(provider),
  ),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
