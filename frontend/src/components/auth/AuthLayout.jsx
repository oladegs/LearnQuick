import { BrainCircuit, CheckCircle2, FileText, Sparkles } from "lucide-react";

const benefits = [
  { icon: FileText, text: "Turn documents into focused study material" },
  { icon: Sparkles, text: "Ask AI for explanations grounded in your content" },
  { icon: CheckCircle2, text: "Practice with flashcards and quizzes" },
];

const AuthLayout = ({ eyebrow, title, subtitle, children }) => (
  <main className="grid min-h-screen bg-[#0d0d0e] lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.26),transparent_26rem),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,34px_34px,34px_34px]" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/25"><BrainCircuit size={22} strokeWidth={2.5} /></span>
        <div><p className="text-base font-extrabold">LearnQuick</p><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">AI learning studio</p></div>
      </div>
      <div className="relative max-w-xl py-12">
        <p className="eyebrow mb-5">Study with clarity</p>
        <h1 className="text-5xl font-extrabold leading-[1.04] tracking-[-0.05em] xl:text-6xl">From source material to real understanding.</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-stone-400">LearnQuick brings your documents, AI guidance, recall, and practice into one intentional learning flow.</p>
        <div className="mt-10 space-y-4">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm font-semibold text-stone-300"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300"><Icon size={17} /></span>{text}</div>
          ))}
        </div>
      </div>
      <p className="relative text-xs text-stone-600">Understand · Recall · Practice · Review</p>
    </section>

    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ef] px-4 py-10 dark:bg-[#111112] sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.13),transparent_25rem)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex items-center gap-3 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white"><BrainCircuit size={20} /></span>
          <span className="font-extrabold text-stone-950 dark:text-white">LearnQuick</span>
        </div>
        <div className="surface-card rounded-[24px] p-7 sm:p-9">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-stone-950 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  </main>
);

export default AuthLayout;
