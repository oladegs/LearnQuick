import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  Layers3,
  MessageSquareText,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import PublicNavbar from "../components/layout/PublicNavbar";
import Footer from "../components/layout/Footer";

const features = [
  { title: "Document Intelligence", description: "Upload learning material and turn it into focused study content.", icon: FileText },
  { title: "AI Learning Assistant", description: "Ask questions grounded in the documents you trust.", icon: MessageSquareText },
  { title: "Smart Flashcards", description: "Generate active-recall cards automatically from your material.", icon: Layers3 },
  { title: "Adaptive Quizzes", description: "Test understanding with focused AI-generated questions.", icon: Target },
  { title: "Progress Tracking", description: "See how your documents, reviews, and quiz activity evolve.", icon: BarChart3 },
  { title: "Focused Review", description: "Return to weak areas and reinforce understanding over time.", icon: BookOpen },
];

const steps = [
  ["Upload", "Add the PDF or learning material you already use."],
  ["Understand", "Ask questions and request clear explanations."],
  ["Practice", "Generate flashcards and quizzes from the same source."],
  ["Review", "Track activity and revisit the ideas that need attention."],
];

const LandingPage = () => (
  <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#080d17] dark:text-slate-50">
    <PublicNavbar />

    <main>
      <section className="relative overflow-hidden px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.17),transparent_38rem),linear-gradient(rgba(37,99,235,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.035)_1px,transparent_1px)] bg-size-[auto,36px_36px,36px_36px] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.25),transparent_40rem),linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-blue-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300"><Sparkles size={15} />AI-powered learning workspace</div>
            <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">Turn your study material into <span className="text-blue-600 dark:text-sky-400">understanding.</span></h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">LearnQuick turns your documents into explanations, AI conversations, flashcards, quizzes, and focused review—all connected to the same source.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700">Get started <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Link>
              <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:bg-sky-500/10"><Play size={16} />Log in</Link>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Upload · Understand · Practice · Review</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
            <div className="pointer-events-none absolute inset-x-20 -bottom-8 h-36 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-950/15 dark:border-white/10 dark:bg-[#111827]">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" /><span className="text-xs font-bold text-slate-700 dark:text-slate-200">LearnQuick workspace</span></div>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-sky-500/10 dark:text-sky-300">AI READY</span>
              </div>
              <div className="grid gap-3 p-3 md:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-[#080d17]">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-sky-400">Document intelligence</p><h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">Neural Networks — Study Guide</h3></div><FileText className="text-blue-600 dark:text-sky-400" /></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"><Sparkles className="h-5 w-5 text-blue-600 dark:text-sky-400" /><p className="mt-3 text-xs font-bold text-slate-900 dark:text-white">AI explanation</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">Break complex material into clear, grounded ideas.</p></div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"><MessageSquareText className="h-5 w-5 text-blue-600 dark:text-sky-400" /><p className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Document chat</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">Ask follow-up questions without losing context.</p></div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-blue-600 p-5 text-white"><Layers3 size={22} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-blue-100">Smart flashcards</p><p className="mt-2 text-base font-extrabold">What is backpropagation?</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-white" /></div></div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-900 dark:text-white">Quiz progress</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">8 of 10 answered</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-extrabold text-emerald-600 dark:text-emerald-300">80%</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-14 dark:border-white/10 dark:bg-[#0b1220] sm:px-8">
        <div className="mx-auto grid max-w-[1100px] gap-8 text-center sm:grid-cols-3">
          {[["One source", "Every learning tool stays grounded in your material."], ["One flow", "Move from reading to understanding and practice."], ["Built for focus", "Spend less time switching tools and more time learning."]].map(([title, text]) => <div key={title}><p className="text-lg font-extrabold text-slate-950 dark:text-white">{title}</p><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p></div>)}
        </div>
      </section>

      <section id="features" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl"><p className="eyebrow mb-3">Everything stays connected</p><h2 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">A complete learning workflow, not another disconnected AI tool.</h2><p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Start with your own source material and keep every explanation, practice session, and result in context.</p></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => <article key={title} className="surface-card group rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-sky-400/35"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:-translate-y-0.5 dark:bg-sky-500/10 dark:text-sky-300"><Icon size={21} /></span><h3 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#0b1220] px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-400">A focused four-step loop</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">From upload to active understanding.</h2></div>
          <div className="relative mt-12 grid gap-6 md:grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 md:block" />
            {steps.map(([title, description], index) => <div key={title} className="relative"><span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold shadow-lg shadow-blue-600/30">{index + 1}</span><h3 className="mt-5 text-base font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section id="why-learnquick" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div><p className="eyebrow mb-3">Why LearnQuick</p><h2 className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">One workspace. One source of truth. One learning flow.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">Your document remains the anchor. Explanations, conversations, flashcards, quizzes, and progress all stay connected to the same material.</p></div>
          <div className="surface-card rounded-[24px] p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Document stays at the center", "AI answers retain context", "Practice comes from your source", "Progress connects to real activity"].map((item) => <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-sky-400" /><span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[24px] bg-blue-600 px-6 py-12 text-center text-white shadow-2xl shadow-blue-600/20 sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_22rem),radial-gradient(circle_at_90%_100%,rgba(56,189,248,0.3),transparent_24rem)]" />
          <div className="relative mx-auto max-w-3xl"><h2 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Ready to learn from your material instead of just reading it?</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-100">Turn documents into understanding, practice, and measurable progress.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/register" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-blue-700 hover:bg-blue-50">Get started</Link><Link to="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white hover:bg-white/15">Log in</Link></div></div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default LandingPage;
