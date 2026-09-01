import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import Button from "../common/Button";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import QuizCard from "./QuizCard";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const generateRequestInFlight = useRef(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch quizzes.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId, fetchQuizzes]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();

    // A ref closes the small gap before React re-renders the disabled button,
    // preventing a fast double-click from creating duplicate quizzes.
    if (generateRequestInFlight.current) return;
    generateRequestInFlight.current = true;
    setGenerating(true);

    try {
      const response = await aiService.generateQuiz(documentId, {
        numQuestions,
      });
      const generatedQuiz = response?.data;

      if (!generatedQuiz?._id) {
        throw new Error("The server did not return the generated quiz.");
      }

      // The POST response already contains the saved quiz. Insert it directly
      // instead of replacing the whole quiz area with a spinner for another GET.
      setQuizzes((currentQuizzes) => [
        generatedQuiz,
        ...currentQuizzes.filter((quiz) => quiz._id !== generatedQuiz._id),
      ]);
      toast.success("Quiz generated successfully!");
      setIsGenerateModalOpen(false);
    } catch (error) {
      toast.error(
        error?.error || error?.message || "Failed to generate quiz.",
      );
    } finally {
      generateRequestInFlight.current = false;
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

const handleConfirmDelete = async () => {
  if (!selectedQuiz) return;

  setDeleting(true);
  try {
    await quizService.deleteQuiz(selectedQuiz._id);
    toast.success(`${selectedQuiz.title || 'Quiz'} deleted.`);
    setIsDeleteModalOpen(false);
    setSelectedQuiz(null);
    setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
  } catch (error) {
    toast.error(error.message || 'Failed to delete quiz.');
  } finally {
    setDeleting(false);
  }
};

const renderQuizContent = () => {
  // Keep existing cards mounted during any later refresh so the page does not
  // flash back to a blank loading state.
  if (loading && quizzes.length === 0) {
    return (
      <div
        role="status"
        className="flex min-h-40 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-400"
      >
        Loading quizzes...
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <EmptyState
        title="No Quizzes Yet"
        description="Generate a quiz from your document to test your knowledge."
      />
    );
 }

return (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {quizzes.map((quiz) => (
      <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
    ))}
  </div>
);
};

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827]/85 p-6 shadow-2xl shadow-black/20">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setIsGenerateModalOpen(true)}>
          <Plus size={16} />
          Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}


    {/* Generate Quiz */}
<Modal
  isOpen={isGenerateModalOpen}
  onClose={() => setIsGenerateModalOpen(false)}
  title="Generate New Quiz"
>
  <form onSubmit={handleGenerateQuiz} className="space-y-4">
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1.5">
        Number of Questions
      </label>
      <input
        type="number"
        value={numQuestions}
        onChange={(e) =>
          setNumQuestions(
            Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)),
          )
        }
        min="1"
        max="20"
        required
        className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-100 placeholder-slate-500 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </div>

    <div className="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsGenerateModalOpen(false)}
        disabled={generating}
      >
        Cancel
      </Button>

      <Button type="submit" disabled={generating}>
        {generating ? "Generating..." : "Generate"}
      </Button>
    </div>
  </form>
</Modal>

      {/* Delete Confirmation - Quiz */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Quiz?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Are you sure you want to delete this quiz:{" "}
            <span className="font-semibold text-white">
              {selectedQuiz?.title || 'this quiz'}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700
              focus:ring-red-500"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
</div>
  ); 
};

export default QuizManager;
