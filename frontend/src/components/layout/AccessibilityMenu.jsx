import React, { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  Check,
  Contrast,
  Eye,
  RotateCcw,
  Type,
} from "lucide-react";

const ACCESSIBILITY_STORAGE_KEY = "learnquick-accessibility";

const defaultPreferences = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
};

const preferenceOptions = [
  {
    key: "largeText",
    label: "Larger text",
    description: "Increase base text size for easier reading.",
    icon: Type,
  },
  {
    key: "highContrast",
    label: "High contrast",
    description: "Strengthen colors and borders across the interface.",
    icon: Contrast,
  },
  {
    key: "reduceMotion",
    label: "Reduce motion",
    description: "Minimize transitions and animations.",
    icon: Eye,
  },
];

const getInitialPreferences = () => {
  if (typeof window === "undefined") return defaultPreferences;

  try {
    const storedPreferences = JSON.parse(
      window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY),
    );

    return {
      ...defaultPreferences,
      ...(storedPreferences || {}),
    };
  } catch {
    return defaultPreferences;
  }
};

const applyPreferences = (preferences) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle(
    "a11y-large-text",
    preferences.largeText,
  );
  document.documentElement.classList.toggle(
    "a11y-high-contrast",
    preferences.highContrast,
  );
  document.documentElement.classList.toggle(
    "a11y-reduce-motion",
    preferences.reduceMotion,
  );
};

const AccessibilityMenu = () => {
  const [preferences, setPreferences] = useState(getInitialPreferences);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const activeCount = Object.values(preferences).filter(Boolean).length;

  useEffect(() => {
    applyPreferences(preferences);
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const togglePreference = (key) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: !currentPreferences[key],
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-sky-500/10"
        aria-label="Accessibility options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Accessibility size={18} strokeWidth={2.4} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-xs font-bold text-white shadow-lg shadow-sky-500/30">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-white/10 bg-[#111827]/95 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="menu"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">
              Accessibility
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Adjust reading, contrast, and motion preferences.
            </p>
          </div>

          {preferenceOptions.map((option) => {
            const OptionIcon = option.icon;
            const isEnabled = preferences[option.key];

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => togglePreference(option.key)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-sky-500/10"
                role="menuitemcheckbox"
                aria-checked={isEnabled}
              >
                <OptionIcon
                  size={20}
                  strokeWidth={2.5}
                  className="mt-0.5 shrink-0 text-slate-400"
                />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-200">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                    {option.description}
                  </span>
                </span>
                {isEnabled && (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="mt-1 text-sky-400"
                  />
                )}
              </button>
            );
          })}

          <div className="border-t border-white/10 px-2 pt-2">
            <button
              type="button"
              onClick={resetPreferences}
              className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm font-semibold text-slate-300 transition-colors duration-150 hover:bg-sky-500/10 hover:text-white"
              role="menuitem"
            >
              <RotateCcw size={18} strokeWidth={2.4} />
              Reset accessibility settings
            </button>
          </div>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {activeCount > 0
          ? `${activeCount} accessibility option${activeCount === 1 ? "" : "s"} enabled`
          : "No accessibility options enabled"}
      </span>
    </div>
  );
};

export default AccessibilityMenu;
