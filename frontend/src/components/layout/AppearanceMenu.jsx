import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MonitorCog, Moon, Sun } from "lucide-react";

const THEME_STORAGE_KEY = "learnquick-theme";

const themeOptions = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Device default", icon: MonitorCog },
];

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return ["light", "dark", "system"].includes(storedTheme)
    ? storedTheme
    : "dark";
};

const applyTheme = (theme) => {
  if (typeof window === "undefined") return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
};

const AppearanceMenu = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const activeOption =
    themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== "system") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

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

  const handleThemeSelect = (nextTheme) => {
    setTheme(nextTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-sky-500/10"
        aria-label="Change appearance"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <ActiveIcon size={18} strokeWidth={2.4} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#111827]/95 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="menu"
        >
          {themeOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeSelect(option.value)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-colors duration-150 hover:bg-sky-500/10 hover:text-white"
                role="menuitemradio"
                aria-checked={isSelected}
              >
                <OptionIcon
                  size={20}
                  strokeWidth={2.5}
                  className="shrink-0 text-slate-400"
                />
                <span className="flex-1">{option.label}</span>
                {isSelected && (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="text-sky-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppearanceMenu;
