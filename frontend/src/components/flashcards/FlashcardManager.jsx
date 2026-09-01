import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const generateRequestInFlight = useRef(false);

  const fetchFlashcardSets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(
        documentId
      );
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId, fetchFlashcardSets]);

  const handleGenerateFlashcards = async () => {
    if (generateRequestInFlight.current) return;
    generateRequestInFlight.current = true;
    setGenerating(true);

    try {
      const response = await aiService.generateFlashcards(documentId);
      const generatedSet = response?.data;

      if (!generatedSet?._id) {
        throw new Error("The server did not return the generated flashcards.");
      }

      // The POST response contains the saved set, so update the list directly
      // instead of blanking the page while making a second GET request.
      setFlashcardSets((currentSets) => [
        generatedSet,
        ...currentSets.filter((set) => set._id !== generatedSet._id),
      ]);
      toast.success("Flashcards generated successfully!");
    } catch (error) {
      toast.error(
        error?.error || error?.message || "Failed to generate flashcards.",
      );
    } finally {
      generateRequestInFlight.current = false;
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
      );
    }
  };

  const handlePrevCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + selectedSet.cards.length) %
          selectedSet.cards.length
      );
    }
  };

  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch {
      toast.error("Failed to review flashcard.");
    }
  };

const handleToggleStar = async (cardId) => {
  if (!cardId) return;

  try {
    await flashcardService.toggleStar(cardId);

    setFlashcardSets((prevSets) =>
      prevSets.map((set) => ({
        ...set,
        cards: set.cards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        ),
      }))
    );

    setSelectedSet((prevSelected) => {
      if (!prevSelected) return prevSelected;
      return {
        ...prevSelected,
        cards: prevSelected.cards.map((card) =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        ),
      };
    });

    toast.success("Flashcard starred status updated!");
  } catch {
    toast.error("Failed to update star status.");
  }
};

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

const handleConfirmDelete = async () => {
  if (!setToDelete) return;

  const deletedSetId = setToDelete._id;
  setDeleting(true);
  try {
    await flashcardService.deleteFlashcardSet(deletedSetId);
    setFlashcardSets((currentSets) =>
      currentSets.filter((set) => set._id !== deletedSetId),
    );
    toast.success("Flashcard set deleted successfully!");
    setIsDeleteModalOpen(false);
    setSetToDelete(null);
  } catch (error) {
    toast.error(
      error?.error || error?.message || "Failed to delete flashcard set.",
    );
  } finally {
    setDeleting(false);
  }
};

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

const renderFlashcardViewer = () => {
  const currentCard = selectedSet.cards[currentCardIndex];

  return (
    <div className="">
      {/* Back Button */}
      <button
        onClick={() => setSelectedSet(null)}
        className="group inline-flex items-center gap-2 font-medium text-sm text-slate-400 hover:text-sky-300 transition-colors duration-200"
      >
        <ArrowLeft
          className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
          strokeWidth={2}
        />
        Back to Sets
      </button>

      {/* Flashcard Display */}  
      <div className="flex flex-col items-center space-y-8">
        <div className="w-full max-w-2xl">
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>

          {/* Navigation Controls */}
<div className="flex items-center gap-6">
  <button
    onClick={handlePrevCard}
    disabled={selectedSet.cards.length <= 1}
    className="group flex items-center gap-2 px-5 h-11 bg-white/[0.06] hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/[0.06]"
  >
    <ChevronLeft
      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
      strokeWidth={2.5}
    />
    Previous
  </button>

  <div className="px-4 py-2 bg-white/[0.04] rounded-lg border border-white/10">
    <span className="text-sm font-semibold text-slate-300">
      {currentCardIndex + 1}{" "}
      <span className="text-slate-400 font-normal ">/</span>{" "}
      {selectedSet.cards.length}
    </span>
  </div>

  <button
    onClick={handleNextCard}
    disabled={selectedSet.cards.length <= 1}
    className="group flex items-center gap-2 px-5 h-11 bg-white/[0.06] hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/[0.06]"
  >
    Next
    <ChevronRight
      className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
      strokeWidth={2.5}
    />
  </button>
</div>
      </div>
    </div>
  );
};

const renderSetList = () => {
  if (loading && flashcardSets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

if (flashcardSets.length === 0) {

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10">
        <Brain className="h-8 w-8 text-sky-300" strokeWidth={2} />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        No Flashcards Yet
      </h3>

      <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
        Generate flashcards from your document to start learning and reinforce your knowledge.
      </p>

      <button
        onClick={handleGenerateFlashcards}
        disabled={generating}
        className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" strokeWidth={2} />
            Generate Flashcards
          </>
        )}
      </button>
    </div>
  );
}

return (
  <div className="space-y-6">
    {/* Header with Generate Button */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Your Flashcard Sets
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {flashcardSets.length}{" "}
          {flashcardSets.length === 1 ? "set" : "sets"} available
        </p>
      </div>

      <button
        onClick={handleGenerateFlashcards}
        disabled={generating}
        className="group inline-flex items-center gap-2 px-4 h-11 bg-linear-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Generate New Set
          </>
        )}
      </button>
    </div>

    {/* Flashcard Sets Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcardSets.map((set) => (
        <div
          key={set._id}
          onClick={() => handleSelectSet(set)}
          className="group relative cursor-pointer rounded-2xl border border-white/10 bg-[#111827]/85 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:shadow-lg hover:shadow-sky-500/10"
        >
          {/* Delete Button */}
          <button
            onClick={(e) => handleDeleteRequest(e, set)}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 opacity-0 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Set Content */}
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
              <Brain className="h-6 w-6 text-sky-300" strokeWidth={2} />
            </div>

            <div>
              <h4 className="text-base font-semibold text-white mb-1">
                Flashcard Set
              </h4>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Created {moment(set.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
         

          <div className="flex items-center gap-2 pt-2 border-slate-100">
            <div className="rounded-lg border border-sky-400/20 bg-sky-500/10 px-3 py-1.5">
              <span className="text-sm font-semibold text-sky-200">
                {set.cards.length}{" "}
                {set.cards.length === 1 ? "card" : "cards"}
              </span>
            </div>
          </div>
        </div>
         </div>
      ))}
    </div>
  </div>
);

};

  return (
    <>
    <div className="bg-[#111827]/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl shadow-black/20 p-8">
      {selectedSet ? renderFlashcardViewer() : renderSetList()}
    </div>

{/* Delete Confirmation Modal */}
<Modal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  title="Delete Flashcard Set?"
>
  <div className="space-y-6">
    <p className="text-sm text-slate-400">
      Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
    </p>

    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={() => setIsDeleteModalOpen(false)}
        disabled={deleting}
        className="px-5 h-11 bg-white/[0.06] hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>

      <button
        onClick={handleConfirmDelete}
        disabled={deleting}
        className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {deleting ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Deleting...
          </span>
        ) : (
          "Delete Set"
        )}
      </button>
    </div>
  </div>
</Modal>
    </>
  );
};

export default FlashcardManager;
