// Presents Google as an additional option above the normal email forms.
import React, { useEffect, useState } from "react";

import authService from "../../services/authService";
import { BASE_URL } from "../../utils/apiPaths";

const GoogleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.72-.06-1.26-.2-1.82H12v3.64h5.52a4.8 4.8 0 0 1-2.05 3.06l-.02.12 2.98 2.31.21.02c1.94-1.8 2.96-4.43 2.96-7.33Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.89 6.64-2.44l-3.17-2.45c-.85.57-1.98.97-3.47.97a6.03 6.03 0 0 1-5.7-4.17l-.12.01-3.1 2.4-.04.12A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.3 13.91A6.2 6.2 0 0 1 5.96 12c0-.67.12-1.3.32-1.91v-.13L3.14 7.52l-.1.05A10 10 0 0 0 2 12c0 1.6.38 3.12 1.04 4.44l3.26-2.53Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.92c1.88 0 3.14.81 3.86 1.48l2.85-2.78A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.57l3.24 2.52A6.05 6.05 0 0 1 12 5.92Z"
    />
  </svg>
);

const SocialAuthButtons = () => {
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [loadingConfiguration, setLoadingConfiguration] = useState(true);
  const [openingGoogle, setOpeningGoogle] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;

    authService
      .getProviders()
      .then(({ google }) => {
        if (active) setGoogleConfigured(Boolean(google));
      })
      .catch(() => {
        if (active) {
          setStatusMessage(
            "Google sign-in is temporarily unavailable. You can still continue with email.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingConfiguration(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const continueWithGoogle = () => {
    if (!googleConfigured || openingGoogle) return;

    setOpeningGoogle(true);
    setStatusMessage("Opening Google sign-in...");
    sessionStorage.setItem("learnquick_oauth_provider", "google");
    window.location.assign(`${BASE_URL}/api/auth/google`);
  };

  const unavailable = !loadingConfiguration && !googleConfigured;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={loadingConfiguration || unavailable || openingGoogle}
        aria-label="Continue with Google"
        aria-describedby={statusMessage ? "google-auth-status" : undefined}
        title={
          unavailable
            ? "Add Google credentials to the backend .env file"
            : "Continue with Google"
        }
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {openingGoogle ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400/30 border-t-sky-400" />
        ) : (
          <GoogleIcon />
        )}
        {openingGoogle ? "Connecting to Google..." : "Continue with Google"}
      </button>

      {unavailable && !statusMessage && (
        <p className="text-center text-xs text-amber-200/80">
          Google sign-in needs to be configured by the app owner.
        </p>
      )}

      {statusMessage && (
        <p
          id="google-auth-status"
          role="status"
          className="text-center text-xs text-slate-400"
        >
          {statusMessage}
        </p>
      )}

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-slate-500">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
};

export default SocialAuthButtons;
