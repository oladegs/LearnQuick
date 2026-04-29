// Explains what LearnQuick does and highlights the AI learning assistant features.
import React from "react";
import {
  BrainCircuit,
  FileText,
  Layers3,
  MessageSquareText,
  Sparkles,
  Trophy,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";

const features = [
  {
    title: "AI-Guided Document Study",
    description:
      "Upload learning material so LearnQuick can help you study from the documents you already use.",
    icon: FileText,
  },
  {
    title: "AI Learning Assistant",
    description:
      "Ask questions, request explanations, and get focused help that stays connected to your study material.",
    icon: MessageSquareText,
  },
  {
    title: "Flashcards",
    description:
      "Use AI-generated flashcard sets to review key ideas and practice active recall.",
    icon: Layers3,
  },
  {
    title: "Quizzes",
    description:
      "Practice with AI-generated quizzes and check your results after each attempt.",
    icon: Trophy,
  },
];

const AboutPage = () => {
  return (
    <div>
      <PageHeader
        title="About LearnQuick"
        subtitle="An AI learning assistant for turning course material into explanations, flashcards, quizzes, and focused review."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <BrainCircuit size={26} strokeWidth={2.4} />
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              LearnQuick is an AI learning assistant built to help you study
              smarter from the material you already have.
            </h2>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              The app uses AI to help students understand uploaded documents,
              ask questions, generate explanations, create flashcards, build
              quizzes, and track learning progress in one organized workspace.
              It is designed to act like a study partner that helps you review
              faster, test understanding, and return to topics that need more
              practice.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Built as an AI-powered study partner for quick review, active
                recall, and consistent learning sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-lg shadow-slate-200/40 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-emerald-600 dark:bg-slate-800 dark:text-emerald-300">
              <feature.icon size={22} strokeWidth={2.3} />
            </div>
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              {feature.title}
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AboutPage;
