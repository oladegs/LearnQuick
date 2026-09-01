import { ArrowRight, BrainCircuit, FileText, Layers3, MessageSquareText, Sparkles, Trophy } from "lucide-react";
import PageHeader from "../components/common/PageHeader";

const features = [
  { title: "AI-Guided Document Study", description: "Study directly from the source material you already trust and use.", icon: FileText },
  { title: "AI Learning Assistant", description: "Ask focused questions and get explanations grounded in your documents.", icon: MessageSquareText },
  { title: "Flashcards", description: "Turn important ideas into active-recall practice you can revisit anytime.", icon: Layers3 },
  { title: "Quizzes", description: "Test understanding, review answers, and identify what needs another look.", icon: Trophy },
];
const steps = ["Upload", "Understand", "Practice", "Review"];

const AboutPage = () => (
  <div>
    <PageHeader eyebrow="Our purpose" title="About LearnQuick" subtitle="A focused AI learning workspace that turns your own material into understanding, recall, and practice." />
    <section className="relative overflow-hidden rounded-[24px] bg-[#171717] p-7 text-white shadow-2xl shadow-stone-950/15 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_20%,rgba(249,115,22,0.35),transparent_23rem)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-end">
        <div className="max-w-3xl">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/25"><BrainCircuit size={28} strokeWidth={2.4} /></span>
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl">Learning tools should reduce friction—not add another layer of noise.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">LearnQuick keeps your source document at the center while AI helps you explain difficult ideas, build recall, test understanding, and return to the concepts that matter.</p>
        </div>
        <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5">
          <Sparkles className="mb-3 h-6 w-6 text-orange-300" />
          <p className="text-sm font-bold leading-6 text-orange-100">One connected flow for reading, asking, remembering, and practicing.</p>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => (
        <article key={feature.title} className="surface-card group rounded-[18px] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-400/30">
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white dark:text-orange-300"><feature.icon size={21} strokeWidth={2.3} /></span>
          <h3 className="text-base font-extrabold text-stone-950 dark:text-white">{feature.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{feature.description}</p>
        </article>
      ))}
    </section>

    <section className="surface-card mt-6 rounded-[20px] p-6 sm:p-8">
      <p className="eyebrow mb-3">A simpler study loop</p>
      <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-stone-950 dark:text-white">How LearnQuick works</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 sm:block">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-extrabold text-white">{index + 1}</span>
              <span className="text-sm font-bold text-stone-900 dark:text-white">{step}</span>
              {index < steps.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-stone-400 sm:block" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default AboutPage;
