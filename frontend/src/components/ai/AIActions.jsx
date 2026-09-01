import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";

const AIActions = () => {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Generated Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();

    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }

    setLoadingAction("explain");

    try {
      const { explanation } = await aiService.explainConcept(documentId, concept);

      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch {
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-sky-400/20 bg-[#111827]/85 shadow-2xl shadow-sky-500/10 backdrop-blur-xl">
        <div className="border-b border-white/10 bg-sky-500/8 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-slate-400">Summaries and explanations from your document</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:bg-sky-500/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10">
                    <BookOpen className="h-4 w-4 text-sky-300" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold text-white">Generate Summary</h4>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Get a concise, structured summary of the entire document.
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="h-10 shrink-0 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 hover:shadow-sky-500/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingAction === "summary" ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Loading...
                  </span>
                ) : (
                  "Summarize"
                )}
              </button>
            </div>
          </div>

          <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/35 hover:bg-sky-500/10">
            <form onSubmit={handleExplainConcept}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/10">
                  <Lightbulb className="h-4 w-4 text-sky-300" strokeWidth={2} />
                </div>
                <h4 className="font-semibold text-white">Explain a Concept</h4>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                Enter a topic from the document to get a focused explanation.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder='e.g., "Javascript"'
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-sky-400 focus:bg-white/[0.06] focus:outline-none focus:shadow-lg focus:shadow-sky-500/10"
                  disabled={loadingAction === "explain"}
                />

                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="h-11 shrink-0 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingAction === "explain" ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Loading...
                    </span>
                  ) : (
                    "Explain"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AIActions;
