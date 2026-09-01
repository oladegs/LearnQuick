import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from "lucide-react";
import moment from "moment";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <article
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/85 p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/35 hover:shadow-sky-500/10"
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === "Enter") handleNavigate();
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${document.title}`}
    >
      {/* Header Section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-600 shadow-lg shadow-sky-500/25 transition-transform duration-300">
            <FileText className="w-6 h-6 text-white" strokeWidth={2} />
          </div>

          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 opacity-100 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            aria-label={`Delete ${document.title}`}
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Title */}
        <h3
          className="mb-2 truncate text-base font-semibold text-white"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Document Info */}
        <div className="mb-3 flex items-center gap-3 text-xs text-slate-400">
          {document.fileSize !== undefined && (
            <span className="font-medium">
              {formatFileSize(document.fileSize)}
            </span>
          )}
          {document.status && (
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${document.status === "ready" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : document.status === "failed" ? "bg-red-500/10 text-red-600 dark:text-red-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
              {document.status}
            </span>
          )}
        </div>

        {/* Stats Section */}
        <div className="flex items-center gap-3">
          {document.flashcardCount !== undefined && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2.5 py-1.5">
              <BookOpen
                className="h-3.5 w-3.5 text-sky-300"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-sky-200">
                {document.flashcardCount} Flashcards
              </span>
            </div>
          )}

          {document.quizCount !== undefined && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/10 px-2.5 py-1.5">
              <BrainCircuit
                className="h-3.5 w-3.5 text-sky-300"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-sky-200">
                {document.quizCount} Quizzes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Uploaded {moment(document.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-sky-500/0 to-sky-400/0 transition-all duration-300 group-hover:from-sky-500/8 group-hover:to-sky-400/5" />
    </article>
  );
};

export default DocumentCard;
