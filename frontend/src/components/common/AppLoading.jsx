import React from "react";
import { BrainCircuit } from "lucide-react";

const AppLoading = ({ label = "Loading LearnQuick..." }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 text-slate-950 dark:bg-[#0B0F19] dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-2xl shadow-sky-500/25">
          <BrainCircuit size={30} strokeWidth={2.5} />
          <span className="absolute inset-0 rounded-2xl border border-white/30" />
        </div>

        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-sky-500" />
        </div>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
};

export default AppLoading;
