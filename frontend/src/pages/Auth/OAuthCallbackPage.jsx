// Completes an OAuth redirect by hydrating the normal LearnQuick session.
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const oauthErrors = {
  oauth_cancelled: "Sign-in was cancelled. You can try again when ready.",
  invalid_oauth_state:
    "The sign-in request could not be verified. Please start again.",
  oauth_state_expired: "The sign-in request expired. Please start again.",
  provider_not_configured:
    "That sign-in provider has not been configured yet.",
  oauth_configuration_error:
    "That sign-in provider is temporarily unavailable.",
  account_link_required:
    "Google could not safely link this email to the existing account.",
  provider_already_linked:
    "That Google account is already linked to another LearnQuick account.",
  unverified_google_email:
    "LearnQuick requires a Google account with a verified email address.",
  missing_email:
    "The provider did not share an email address. Allow email access and try again.",
  invalid_identity: "The provider identity could not be verified.",
  provider_error: "The provider could not complete sign-in.",
  oauth_authentication_failed:
    "Connected sign-in could not be completed. Please try again.",
};

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const callbackErrorCode = searchParams.get("error");
  const [oauthToken] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get("token"),
  );
  const [error, setError] = useState(() =>
    callbackErrorCode
      ? oauthErrors[callbackErrorCode] ||
        "Connected sign-in could not be completed. Please try again."
      : "",
  );
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    sessionStorage.removeItem("learnquick_oauth_provider");

    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${window.location.search}`,
      );
    }

    if (callbackErrorCode) {
      toast.error(
        oauthErrors[callbackErrorCode] ||
          "Connected sign-in could not be completed. Please try again.",
      );
      return;
    }

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    authService
      .getSession()
      .then(({ user }) => {
        login(user, oauthToken || null);
        toast.success("Signed in successfully!");
        navigate("/dashboard", { replace: true });
      })
      .catch((sessionError) => {
        if (oauthToken) localStorage.removeItem("token");
        const message =
          sessionError.error === "Not authorized, no token"
            ? "Your secure sign-in cookie was not received. Please enable cookies and try again."
            : sessionError.error ||
              sessionError.message ||
              "Your sign-in session could not be restored.";
        setError(message);
        toast.error(message);
      });
  }, [callbackErrorCode, isAuthenticated, login, navigate, oauthToken]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827]/95 p-8 text-center shadow-2xl shadow-black/40 sm:p-10">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/30">
          <BrainCircuit className="h-7 w-7 text-white" />
        </div>

        {error ? (
          <>
            <h1 className="text-xl font-semibold text-white">
              Sign-in needs attention
            </h1>
            <p role="alert" className="mt-3 text-sm text-red-200">
              {error}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
            >
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-white">
              Finishing sign-in
            </h1>
            <p role="status" className="mt-3 text-sm text-slate-400">
              Securely connecting your LearnQuick account...
            </p>
            <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-slate-500/30 border-t-sky-400" />
          </>
        )}
      </div>
    </main>
  );
};

export default OAuthCallbackPage;
