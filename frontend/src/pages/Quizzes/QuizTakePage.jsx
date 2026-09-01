// Lets a student answer quiz questions and submit their responses for grading.
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import quizService from "../../services/quizService";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response.data);
      } catch (error) {
        toast.error(error.message || "Failed to fetch quiz.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (answeredCount !== quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((question, questionIndex) => {
        const optionIndex = selectedAnswers[question._id];

        return {
          questionIndex,
          selectedAnswer: question.options[optionIndex],
        };
      });

      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success("Quiz submitted successfully!");
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 text-lg">
          Quiz not found or has no questions.
        </p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={quiz.title || "Take Quiz"} />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-300">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-slate-500">
            {answeredCount} answered
          </span>
        </div>

        <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-sky-500 to-sky-500 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / quiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      <div className="bg-[#111827]/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20 p-6 mb-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
          <span className="text-sm font-semibold text-sky-200">
            Question {currentQuestionIndex + 1}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

              {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion._id] === index;

            return (
              <label
                key={option}
                className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-sky-400/30 hover:bg-white/[0.05] hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => handleOptionChange(currentQuestion._id, index)}
                  className="sr-only"
                />

                {/* Custom Radio Button*/}
                <div
                  className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-sky-500 bg-sky-500"
                      : "border-slate-500 bg-white/[0.04] group-hover:border-sky-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                    {/* Option Text */}
                <span
                  className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                    isSelected
                      ? "text-sky-100"
                      : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {option}
                </span>

                    {/* Selected Checkmark*/}
                {isSelected && (
                  <CheckCircle2
                    className="ml-auto h-5 w-5 text-sky-300"
                    strokeWidth={2.5}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>

  {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="secondary"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || submitting}
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
          Previous
        </Button>


{isLastQuestion ? (
  <button
    onClick={handleSubmitQuiz}
    disabled={submitting || answeredCount !== quiz.questions.length}
    className="group relative px-8 h-12 bg-linear-to-r from-sky-500
    to-sky-500 hover:from-sky-600 hover:to-sky-600 text-white font-semibold
    text-sm rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden"
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full
    animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
          Submit Quiz
        </>
      )}
    </span>
    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 
    -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
  </button>
) : (
  <Button
    onClick={handleNextQuestion}
    disabled={submitting}
  >
    Next
    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
  </Button>
)}
</div>

{/* Question Navigation Dots */}
<div className="mt-0 flex items-center justify-center gap-2 flex-wrap">
  {quiz.questions.map((_, index) => {
    const isAnsweredQuestion =
      Object.prototype.hasOwnProperty.call(
        selectedAnswers,
        quiz.questions[index]._id,
      );
    const isCurrent = index === currentQuestionIndex;

return (
  <button
    key={index}
    onClick={() => setCurrentQuestionIndex(index)}
    disabled={submitting}
    className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200
      ${isCurrent
        ? "bg-linear-to-r from-sky-500 to-sky-500 text-white shadow-lg shadow-sky-500/25 scale-110"
        : isAnsweredQuestion
        ? "bg-sky-500/15 text-sky-200 hover:bg-sky-500/25"
        : "bg-white/[0.06] text-slate-400 hover:bg-white/10"
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    {index + 1}
  </button>
);
})}
</div>
</div>
);
};

export default QuizTakePage;
