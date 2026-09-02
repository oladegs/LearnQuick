import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import AppearanceMenu from "../layout/AppearanceMenu";
import Footer from "../layout/Footer";

const AuthLayout = ({ eyebrow, title, subtitle, children }) => (
  <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#080d17] dark:text-slate-50">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(37,99,235,0.14),transparent_32rem),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.11),transparent_26rem)]" />
    <header className="relative flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <Link to="/" className="flex items-center gap-3" aria-label="LearnQuick home">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><BrainCircuit size={20} strokeWidth={2.5} /></span>
        <span className="text-base font-extrabold tracking-[-0.02em]">LearnQuick</span>
      </Link>
      <AppearanceMenu />
    </header>

    <section className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
      <div className="surface-card w-full max-w-[460px] rounded-[24px] p-7 sm:p-9">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><BrainCircuit size={24} /></span>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>

    <div className="relative"><Footer /></div>
  </main>
);

export default AuthLayout;
