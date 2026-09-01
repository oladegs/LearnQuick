import React from "react";
import { Command, LogOut, Menu, Pencil, Search, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppearanceMenu from "./AppearanceMenu";
import AccessibilityMenu from "./AccessibilityMenu";

const Header = ({ toggleSidebar, isSidebarOpen, onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);

  React.useEffect(() => {
    const closeOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#151516]/85">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={toggleSidebar} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:bg-orange-500/10" aria-label="Toggle sidebar" aria-controls="app-sidebar" aria-expanded={isSidebarOpen}>
            <Menu size={21} />
          </button>
          <div className="hidden min-w-0 lg:block">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-orange-500" strokeWidth={2.5} />
              <p className="text-sm font-bold text-stone-950 dark:text-white">Learning workspace</p>
            </div>
            <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-500">Understand. Recall. Practice.</p>
          </div>
        </div>

        <button type="button" onClick={onOpenCommandPalette} className="hidden h-11 min-w-72 max-w-xl flex-1 items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-medium text-stone-500 transition-all hover:border-orange-300 hover:bg-orange-50/60 md:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-orange-500/10" aria-label="Open command palette">
          <span className="flex items-center gap-2"><Search size={16} />Search or jump to...</span>
          <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[10px] font-bold dark:border-white/10 dark:bg-black/20"><Command size={11} />K</span>
        </button>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenCommandPalette} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 md:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300" aria-label="Open command palette"><Search size={18} /></button>
          <AccessibilityMenu />
          <AppearanceMenu />

          <div ref={profileMenuRef} className="relative ml-1">
            <button type="button" onClick={() => setIsProfileMenuOpen((open) => !open)} className="flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-2 text-left transition-colors hover:border-orange-300 dark:border-white/10 dark:bg-white/[0.04]" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={isProfileMenuOpen}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white"><User size={16} strokeWidth={2.5} /></span>
              <span className="hidden max-w-28 truncate text-sm font-bold text-stone-900 dark:text-white xl:block">{user?.username || "User"}</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-13 z-50 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl shadow-stone-950/15 dark:border-white/10 dark:bg-[#1c1c1e] dark:shadow-black/40" role="menu">
                <div className="border-b border-stone-200 px-3 py-3 dark:border-white/10">
                  <p className="truncate text-sm font-bold text-stone-950 dark:text-white">{user?.username || "User"}</p>
                  <p className="truncate text-xs text-stone-500">{user?.email}</p>
                </div>
                <button type="button" onClick={() => { setIsProfileMenuOpen(false); navigate("/profile"); }} className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-700 dark:text-stone-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-200" role="menuitem"><Pencil size={16} />Profile settings</button>
                <button type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-stone-700 hover:bg-red-50 hover:text-red-700 dark:text-stone-300 dark:hover:bg-red-500/10 dark:hover:text-red-300" role="menuitem"><LogOut size={16} />Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
