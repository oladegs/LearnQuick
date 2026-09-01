import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquareHeart,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

const commands = [
  {
    label: "Dashboard",
    description: "Review learning progress and recent activity",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: "home analytics overview progress",
  },
  {
    label: "Documents",
    description: "Upload and manage study material",
    path: "/documents",
    icon: FileText,
    keywords: "pdf library upload files notes",
  },
  {
    label: "Flashcards",
    description: "Practice active recall from generated sets",
    path: "/flashcards",
    icon: BookOpen,
    keywords: "study cards review memory",
  },
  {
    label: "Feedback",
    description: "Share ideas, bugs, and product feedback",
    path: "/feedback",
    icon: MessageSquareHeart,
    keywords: "feedback feature request bug rating support",
  },
  {
    label: "Profile Settings",
    description: "Manage account and password",
    path: "/profile",
    icon: User,
    keywords: "account settings password email",
  },
  {
    label: "About LearnQuick",
    description: "See what the AI study assistant can do",
    path: "/about",
    icon: HelpCircle,
    keywords: "help info features ai assistant",
  },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;

    return commands.filter((command) =>
      `${command.label} ${command.description} ${command.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) return undefined;

    window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) =>
          Math.min(index + 1, filteredCommands.length - 1),
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }

      if (event.key === "Enter" && filteredCommands[activeIndex]) {
        event.preventDefault();
        navigate(filteredCommands[activeIndex].path);
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, filteredCommands, isOpen, navigate, onClose]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 px-4 py-20 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-[#111827]/95 dark:shadow-black/50">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <Search className="h-5 w-5 text-sky-500" strokeWidth={2.4} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search actions, pages, and workflows..."
            className="h-11 flex-1 border-0 bg-transparent text-sm font-medium text-slate-950 placeholder-slate-500 outline-none dark:text-white"
            aria-label="Search commands"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close command palette"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;
              const isActive = index === activeIndex;

              return (
                <button
                  key={command.path}
                  type="button"
                  onClick={() => {
                    navigate(command.path);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                    isActive
                      ? "bg-sky-500/10 text-slate-950 ring-1 ring-sky-400/30 dark:text-white"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-500">
                    <Icon size={19} strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {command.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {command.description}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-500">
                <Sparkles size={24} strokeWidth={2.4} />
              </div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                No matching command
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try searching for documents, flashcards, dashboard, or profile.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>Use arrow keys to navigate</span>
          <span>Enter to open · Esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
