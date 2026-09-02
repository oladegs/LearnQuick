// Lists uploaded study documents and provides the upload flow for new PDFs.
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Upload, Trash2, FileText, Search, X } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import { CardGridSkeleton } from "../../components/common/Skeleton";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      const normalizedDocuments = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setDocuments(normalizedDocuments);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchParams.get("upload") === "1") {
      setIsUploadModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((document) =>
      `${document.title} ${document.fileName || ""}`.toLowerCase().includes(query),
    );
  }, [documents, searchTerm]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");

      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted.`);

      setIsDeleteModalOpen(false);
      setSelectedDoc(null);

      setDocuments((prev) => prev.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    const documentList = Array.isArray(documents) ? documents : [];

    if (loading) {
      return <CardGridSkeleton count={6} />;
    }

    if (documentList.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-lg shadow-sky-500/10">
              <FileText
                className="h-10 w-10 text-sky-300"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mb-2 text-xl font-semibold tracking-tight text-white">
              No Documents Yet
            </h3>

            <p className="mb-6 text-sm text-slate-400">
              Get started by uploading your first PDF document to begin
              learning.
            </p>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/35 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    if (filteredDocuments.length === 0) {
      return (
        <div className="surface-card rounded-[20px] border-dashed p-10 text-center">
          <Search className="mx-auto h-8 w-8 text-blue-500" />
          <h3 className="mt-4 text-lg font-bold text-stone-950 dark:text-white">No documents match your search.</h3>
          <p className="mt-1 text-sm text-stone-500">Try a shorter title or clear the search field.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(37,99,235,0.12)_1px,transparent_1px)] bg-size-[18px_18px] opacity-30" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">Your source library</p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
              Documents
            </h1>

            <p className="text-sm text-slate-400">
              Manage and organize your learning materials
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
          {Array.isArray(documents) && documents.length > 0 && (
            <label className="relative block min-w-64">
              <span className="sr-only">Search documents</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search documents..." className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-slate-100 focus:border-sky-400 focus:outline-none" />
            </label>
          )}
          {Array.isArray(documents) && documents.length > 0 && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/35 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          )}
          </div>
        </div>

        {renderContent()}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827]/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Upload New Document
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Add a PDF document to your library
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className="space-y-5">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-100 placeholder-slate-500 transition-all duration-200 focus:border-sky-400 focus:bg-white/[0.06] focus:outline-none focus:shadow-lg focus:shadow-sky-500/10"
                  placeholder="e.g., React Interview Prep"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                  PDF File
                </label>

                <div className="relative flex rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 transition-all duration-200 hover:border-sky-400/50 hover:bg-sky-500/10">
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />

                  <div className="flex flex-col items-center justify-center py-10 px-6 w-full">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                      <Upload
                        className="h-7 w-7 text-sky-300"
                        strokeWidth={2}
                      />
                    </div>

                    <p className="mb-1 text-center text-sm font-medium text-slate-300">
                      {uploadFile ? (
                        <span className="text-sky-300">
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-sky-300">
                            Click to upload
                          </span>
                          <br />
                          or drag and drop
                        </>
                      )}
                    </p>

                    <p className="text-xs text-slate-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="h-11 flex-1 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111827]/95 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10">
                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Confirm Deletion
              </h2>
            </div>

            {/* Content */}
            <p className="mb-6 text-sm text-slate-400">
              Are you sure you want to delete the document:{" "}
              <span className="font-semibold text-white">
                {selectedDoc?.title}
              </span>
              ? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 h-11 px-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
