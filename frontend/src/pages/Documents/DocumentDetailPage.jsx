// Shows one uploaded document, its study tools, AI chat, flashcards, and quizzes.
import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import ChatInterface from "../../components/chat/ChatInterface";
import AIActions from "../../components/ai/AIActions";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { BASE_URL } from "../../utils/apiPaths";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestedTab = searchParams.get("tab");
  const availableTabs = ["Content", "Chat", "AI Actions", "Flashcards", "Quizzes"];
  const [activeTab, setActiveTab] = useState(
    availableTabs.includes(requestedTab) ? requestedTab : "Content",
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "Content" ? {} : { tab }, { replace: true });
  };

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      const parsedUrl = new URL(filePath);
      const wasSavedFromLocalDevelopment = ["localhost", "127.0.0.1"].includes(
        parsedUrl.hostname,
      );

      return wasSavedFromLocalDevelopment
        ? `${BASE_URL}${parsedUrl.pathname}`
        : filePath;
    }

    return `${BASE_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.data || !document.data.filePath) {
      return <div className="text-center p-8">PDF not available.</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/85 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-4">
          <span className="text-sm font-medium text-slate-300">
            Document Viewer
          </span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-sky-300 hover:text-sky-200
            font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        <div className="bg-[#0B0F19] p-1">
          <iframe
            src={pdfUrl}
            className="h-[70vh] w-full rounded border border-white/10 bg-white"
            title="PDF Viewer"
            frameBorder="0"
            style={{
              colorScheme: "light",
            }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
      return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    {
      name: "AI Actions",
      label: "AI Actions",
      content: renderAIActions(),
    },
    {
      name: "Flashcards",
      label: "Flashcards",
      content: renderFlashcardsTab(),
    },
    {
      name: "Quizzes",
      label: "Quizzes",
      content: renderQuizzesTab(),
    },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-sky-300"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>

      <PageHeader
        eyebrow="Document workspace"
        title={document.data.title}
        subtitle={`${document.data.flashcardCount || 0} flashcard set${document.data.flashcardCount === 1 ? "" : "s"} · ${document.data.quizCount || 0} quiz${document.data.quizCount === 1 ? "" : "zes"}`}
      />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default DocumentDetailPage;
