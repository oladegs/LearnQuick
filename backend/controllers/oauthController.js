// Coordinates the Google OIDC redirect and creates the normal LearnQuick JWT
// session after Google verifies the user's identity.
import {
  createAuthorizationRequest,
  exchangeAuthorizationCode,
  findOrCreateGoogleUser,
  getGoogleProvider,
  getOAuthProviderStatus,
} from "../utils/oauthService.js";
import { generateAuthToken, setAuthCookie } from "../utils/authTokens.js";

const GOOGLE_TRANSACTION_COOKIE = "learnquick_oauth_google";

const getFrontendUrl = () =>
  (
    process.env.FRONTEND_URL?.split(",")[0] ||
    "http://localhost:5173"
  )
    .trim()
    .replace(/\/+$/, "");

const transactionCookieOptions = () => ({
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/api/auth",
  ...(process.env.COOKIE_DOMAIN
    ? { domain: process.env.COOKIE_DOMAIN }
    : {}),
});

const clearTransactionCookie = (res) => {
  const { maxAge, signed, ...clearOptions } = transactionCookieOptions();
  res.clearCookie(GOOGLE_TRANSACTION_COOKIE, clearOptions);
};

const redirectWithError = (res, code) =>
  res.redirect(
    `${getFrontendUrl()}/auth/callback?error=${encodeURIComponent(code)}`,
  );

export const getProviders = async (req, res) => {
  res.status(200).json({
    success: true,
    data: getOAuthProviderStatus(),
  });
};

export const startGoogleOAuth = async (req, res) => {
  try {
    const { authorizationUrl, transaction } =
      await createAuthorizationRequest();

    res.cookie(
      GOOGLE_TRANSACTION_COOKIE,
      JSON.stringify(transaction),
      transactionCookieOptions(),
    );
    res.redirect(authorizationUrl.href);
  } catch (error) {
    console.error("Google OAuth start error:", {
      message: error.message,
      code: error.oauthCode,
    });
    redirectWithError(res, error.oauthCode || "oauth_configuration_error");
  }
};

export const handleGoogleCallback = async (req, res) => {
  try {
    const google = getGoogleProvider();

    if (req.query.error) {
      clearTransactionCookie(res);
      return redirectWithError(
        res,
        req.query.error === "access_denied"
          ? "oauth_cancelled"
          : "provider_error",
      );
    }

    const rawTransaction = req.signedCookies?.[GOOGLE_TRANSACTION_COOKIE];
    clearTransactionCookie(res);

    if (!rawTransaction) {
      return redirectWithError(res, "invalid_oauth_state");
    }

    const transaction = JSON.parse(rawTransaction);
    if (
      !transaction.createdAt ||
      Date.now() - transaction.createdAt > 10 * 60 * 1000
    ) {
      return redirectWithError(res, "oauth_state_expired");
    }

    const callbackUrl = new URL(google.callbackUrl);
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") callbackUrl.searchParams.set(key, value);
    }

    const identity = await exchangeAuthorizationCode({
      callbackUrl,
      transaction,
    });
    const user = await findOrCreateGoogleUser(identity);
    const token = generateAuthToken(user._id);
    setAuthCookie(res, token);

    // The fragment is never sent to Vercel or logged in HTTP requests. It
    // provides a bearer-token fallback when browsers block cross-site cookies
    // between the Vercel frontend and Render backend.
    return res.redirect(
      `${getFrontendUrl()}/auth/callback#token=${encodeURIComponent(token)}`,
    );
  } catch (error) {
    console.error("Google OAuth callback error:", {
      message: error.message,
      code: error.oauthCode || error.code,
    });

    return redirectWithError(
      res,
      error.oauthCode || "oauth_authentication_failed",
    );
  }
};
