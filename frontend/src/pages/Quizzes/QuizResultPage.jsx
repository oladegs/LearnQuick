// Shows quiz scores, selected answers, correct answers, and explanations after submission.
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const normalizeAnswer = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^[A-Da-d][).:-]\s*/, "")
    .replace(/^0?[1-4][).:-]\s*/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getAnswerIndex = (answer, options) => {
  const rawAnswer = String(answer ?? "").trim();

  const numericMatch = rawAnswer.match(/^0?([1-4])(?:[).:-]|\s|$)/);
  if (numericMatch) {
    return Number(numericMatch[1]) - 1;
  }

  const letterMatch = rawAnswer.match(/^([A-Da-d])(?:[).:-]|\s|$)/);
  if (letterMatch) {
    return letterMatch[1].toUpperCase().charCodeAt(0) - 65;
  }

  const normalizedAnswer = normalizeAnswer(rawAnswer);
  return options.findIndex((option) => normalizeAnswer(option) === normalizedAnswer);
};

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Quiz results not found.</p>
        </div>
      </div>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;

  const reviewedResults = detailedResults.map((result) => {
    const userAnswerIndex = getAnswerIndex(result.selectedAnswer, result.options);
    const correctAnswerIndex = getAnswerIndex(result.correctAnswer, result.options);
    const isCorrect =
      userAnswerIndex !== -1 && userAnswerIndex === correctAnswerIndex;

    return {
      ...result,
      userAnswerIndex,
      correctAnswerIndex,
      isCorrect,
    };
  });

  const totalQuestions = reviewedResults.length;
  const correctAnswers = reviewedResults.filter((r) => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-sky-500 to-sky-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Outstanding!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Not bad!";
    return "Keep practicing!";
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium
          text-slate-400 hover:text-sky-300 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || "Quiz"} Results`} />

      {/* Score Card */}
      <div
        className="bg-[#111827]/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl
        shadow-black/20 p-8 mb-8"
      >
        <div className="text-center space-y-6">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-lg shadow-sky-500/20"
          >
            <Trophy className="h-7 w-7 text-sky-300" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Your Score
            </p>

            <div
              className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(
                score
              )} bg-clip-text text-transparent mb-2`}
            >
              {score}%
            </div>

            <p className="text-lg font-medium text-slate-300">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl">
              <Target className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-slate-300">
                {totalQuestions} Total
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-2">
              <CheckCircle2
                className="h-4 w-4 text-sky-300"
                strokeWidth={2}
              />
              <span className="text-sm font-semibold text-sky-200">
                {correctAnswers} Correct
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2">
              <XCircle className="h-4 w-4 text-rose-300" strokeWidth={2} />
              <span className="text-sm font-semibold text-rose-200">
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-slate-400" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-white">
            Detailed Review
          </h3>
        </div>

        {reviewedResults.map((result, index) => {
          const { correctAnswerIndex, isCorrect, userAnswerIndex } = result;

          return (
            <div
              key={index}
              className="bg-[#111827]/85 backdrop-blur-xl border border-white/10
              rounded-2xl p-6 shadow-lg shadow-black/20"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/10
                    rounded-lg mb-3"
                  >
                    <span className="text-xs font-semibold text-slate-400">
                      Question {index + 1}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white leading-relaxed">
                    {result.question}
                  </h4>
                </div>

                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect
                      ? "bg-sky-500/10 border-2 border-sky-400/20"
                      : "bg-rose-500/10 border-2 border-rose-400/20"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2
                      className="h-5 w-5 text-sky-300"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <XCircle
                      className="h-5 w-5 text-rose-300"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {result.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === correctAnswerIndex;
                  const isUserAnswer = optIndex === userAnswerIndex;
                  const isWrongAnswer = isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        isCorrectOption
                          ? "bg-sky-500/10 border-sky-400/40 shadow-lg shadow-sky-600/10"
                          : isWrongAnswer
                          ? "bg-rose-500/10 border-rose-400/40"
                          : "bg-white/[0.04] border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm font-medium ${
                            isCorrectOption
                              ? "text-sky-100"
                              : isWrongAnswer
                              ? "text-rose-100"
                              : "text-slate-300"
                          }`}
                        >
                          {option}
                        </span>

                        {/* Indicators */}
                        <div className="flex items-center gap-2">
                          {isCorrectOption && (
                            <span
                              className="inline-flex items-center gap-1 rounded-lg border border-sky-400/30 bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-200"
                            >
                              <CheckCircle2
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              Correct
                            </span>
                          )}

                          {isWrongAnswer && (
                            <span
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-200"
                            >
                              <XCircle
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10">
                      <BookOpen
                        className="h-4 w-4 text-sky-300"
                        strokeWidth={2}
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
<div className="mt-8 flex justify-center">
  <Link to={`/documents/${quiz.document._id}`}>
    <button className="group relative h-12 overflow-hidden rounded-xl bg-sky-500 px-8 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600
     active:scale-95 overflow-hidden">
      <span className="relative z-10 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
        Return to Document
      </span>
      <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full 
      group-hover:translate-x-full transition-transform duration-700" />
    </button>
  </Link>
</div>
    </div>
  );
};

export default QuizResultPage;
