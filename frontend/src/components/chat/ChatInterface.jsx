import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

return (
  <div
    key={index}
    className={`flex items-start gap-3 mb-4 ${isUser ? "justify-end" : ""}`}
  >
    {!isUser && (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
        <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
    )}

    <div
      className={`max-w-lg p-4 rounded-2xl shadow-sm ${
        isUser
          ? "bg-sky-500 text-white rounded-br-md shadow-sky-500/20"
          : "bg-white/[0.04] border border-white/10 text-slate-300 rounded-bl-md"
      }`}
    >
      {isUser ? (
        <p className="">{msg.content}</p>
      ) : (
        <div className="">
          <MarkdownRenderer content={msg.content} />
        </div>
      )}
    </div>

    {isUser && (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold text-slate-200">
        {(msg?.content?.trim?.()?.charAt(0) || "U").toUpperCase()}
      </div>
    )}
  </div>
);
  };

  if (initialLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111827]/85 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10">
          <MessageSquare className="h-7 w-7 text-sky-300" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="mt-3 text-sm font-medium text-slate-400">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-sky-400/20 bg-[#111827]/85 p-4 shadow-2xl shadow-sky-500/10 backdrop-blur-xl sm:p-6">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-[#0B0F19]/70 p-4 sm:p-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-lg shadow-sky-500/10">
              <MessageSquare className="h-8 w-8 text-sky-300" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-400">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        <div ref={messagesEndRef} />

        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 shadow-sky-500/25">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>

            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-300" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-300" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-300" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-[#111827]/80 p-4 sm:p-5">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-sky-400 focus:bg-white/[0.06] focus:outline-none focus:shadow-lg focus:shadow-sky-500/10"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
