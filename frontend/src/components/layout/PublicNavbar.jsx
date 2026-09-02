import { useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, Menu, X } from "lucide-react";
import AppearanceMenu from "./AppearanceMenu";

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const links = [
    ["Features", "#features"],
    ["How it works", "#how-it-works"],
    ["About", "#why-learnquick"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#080d17]/80">
      <nav className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8" aria-label="Public navigation">
        <Link to="/" className="flex items-center gap-3" aria-label="LearnQuick home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><BrainCircuit size={20} strokeWidth={2.5} /></span>
          <span className="text-base font-extrabold tracking-[-0.025em] text-slate-950 dark:text-white">LearnQuick</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => <a key={label} href={href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-300">{label}</a>)}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <AppearanceMenu />
          <Link to="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]">Log in</Link>
          <Link to="/register" className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700">Get started</Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <AppearanceMenu />
          <button type="button" onClick={() => setOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111827] md:hidden">
          <div className="mx-auto max-w-[1280px] space-y-1">
            {links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-sky-500/10">{label}</a>)}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link to="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white">Log in</Link>
              <Link to="/register" className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">Get started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
