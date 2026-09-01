// Lets students review flashcards for a specific document and track their recall.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashcardPage = () => {
  const { id: documentId } = useParams();

  const [flashcardSets, setFlashcardSets] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const generateRequestInFlight = useRef(false);

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(
        documentId
      );

      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

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

      setFlashcardSets(generatedSet);
      setFlashcards(generatedSet.cards || []);
      setCurrentCardIndex(0);
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
    handleReview(currentCardIndex);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    handleReview(currentCardIndex);
    setCurrentCardIndex(
      (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleReview = async (index) => {
    const currentCard = flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) =>
          card._id === cardId
            ? { ...card, isStarred: !card.isStarred }
            : card
        )
      );
      toast.success("Flashcard starred status updated!");
    } catch {
      toast.error("Failed to update star status.");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    if (!flashcardSets?._id) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      setFlashcardSets(null);
      setFlashcards([]);
      setCurrentCardIndex(0);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(
        error?.error || error?.message || "Failed to delete flashcard set.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState title="No flashcards yet." description="Generate a focused set from this document to start practicing active recall." />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md">
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          <span className="text-sm text-slate-400">
            {currentCardIndex + 1} / {flashcards.length}
          </span>

          <Button
            onClick={handleNextCard}
            variant="secondary"
            disabled={flashcards.length <= 1}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

return (
  <div>
    <div className="mb-4">
      <Link
        to={`/documents/${documentId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-400
        hover:text-sky-300 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Document
      </Link>
    </div>

    <PageHeader eyebrow="Study mode" title="Flashcards" subtitle="Use the keyboard or card controls to move through your active-recall session.">
      <div className="flex gap-2">
        {!loading && (
          flashcards.length > 0 ? (
            <>
              <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} disabled={deleting}>
                <Trash2 size={16} /> Delete Set
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerateFlashcards} loading={generating}>
              <Plus size={16} /> Generate Flashcards
            </Button>
          )
        )}
      </div>
    </PageHeader>

    {renderFlashcardContent()}

    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      title="Confirm Delete Flashcard Set"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Are you sure you want to delete all flashcards for this document?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleDeleteFlashcardSet} loading={deleting}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  </div>
);
};

export default FlashcardPage;
