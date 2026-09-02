import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { formatRelativeDate } from "../../utils/formatDate";

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter(
    (card) => card.lastReviewed
  ).length;

  const totalCards = flashcardSet.cards.length;

  const progressPercentage =
    totalCards > 0
      ? Math.round((reviewedCount / totalCards) * 100)
      : 0;

  return (
    <div
      className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-[#111827]/85 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-sky-500/10"
      onClick={handleStudyNow}
    >
      <div className="space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
            <BookOpen className="h-6 w-6 text-sky-300" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-white line-clamp-2 mb-1"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title}
            </h3>

            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Created {formatRelativeDate(flashcardSet.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg">
            <span className="text-sm font-semibold text-slate-300">
              {totalCards} {totalCards === 1 ? "Card" : "Cards"}
            </span>
          </div>

          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/10 px-3 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-sky-300" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-sky-200">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Progress</span>
              <span className="text-xs font-semibold text-slate-300">
                {reviewedCount}/{totalCards} reviewed
              </span>
            </div>

            <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-sky-500
                to-sky-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
   </div>

        {/* Study Button */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStudyNow();
            }}
            className="group/btn relative h-11 w-full overflow-hidden rounded-xl border border-sky-400/20 bg-sky-500/10 text-sm font-semibold text-sky-200
            transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-500 hover:text-white
            active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              Study Now
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20
            to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </button>
     
      </div>
    </div>
  );
};

export default FlashcardSetCard;
