import React from "react";
import { Link } from "react-router-dom";
import { Play, BarChart2, Trash2, Award } from "lucide-react";
import moment from "moment";

const QuizCard = ({ quiz, onDelete }) => {
return (
  <div className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111827]/85 p-4 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-sky-500/10">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(quiz);
      }}
      className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 opacity-0
      transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
    >
      <Trash2 className="w-4 h-4" strokeWidth={2} />
    </button>

    <div className="space-y-4">
      {/* Status Badge */}
      <div className="inline-flex items-center gap-1.5 py-1 rounded-lg text-xs font-semibold">
        <div className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/10 px-3
        py-1">
          <Award className="h-3.5 w-3.5 text-sky-300" strokeWidth={2.5} />
          <span className="text-sky-200">Score: {quiz?.score}</span>
        </div>
      </div>

      <div>
        <h3
          className="text-base font-semibold text-white mb-1 line-clamp-2"
          title={quiz.title}
        >
          {quiz.title ||
            `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
        </h3>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Created {moment(quiz.createdAt).format("MMM D, YYYY")}
        </p>
      </div>

      {/* Quiz Info */}
      <div className="flex items-center gap-3 border-t border-white/10 pt-2">
        <div className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg">
          <span className="text-sm font-semibold text-slate-300">
            {quiz.questions.length}{" "}
            {quiz.questions.length === 1 ? "Question" : "Questions"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2 border-t border-white/10 pt-4">
        {quiz.userAnswers?.length > 0 ? (
          <Link to={`/quizzes/${quiz._id}/results`}>
            <button className="group/btn w-full inline-flex items-center justify-center
            gap-2 h-11 bg-white/[0.06] hover:bg-white/10 text-slate-300 font-semibold text-sm
            rounded-xl transition-all duration-200 active:scale-95 cursor-pointer">
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              View Results
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`}>
            <button className="group/btn relative w-full h-11 bg-linear-to-r from-sky-500
            to-sky-500 hover:from-sky-600 hover:to-sky-600 text-white font-semibold text-sm
            rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25 active:scale-95 overflow-hidden
            ">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Play className="w-4 h-4" strokeWidth={2.5} />
                Start Quiz
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0
              -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </button>
          </Link>
        )}
      </div>
    </div>
  </div>
);
};

export default QuizCard;
