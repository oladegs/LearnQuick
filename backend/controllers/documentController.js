// Handles document uploads, PDF text extraction, document lists, and document cleanup.
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import path from "path";

const getDocumentBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "documentFiles",
  });

const storeDocumentFile = (file, userId) =>
  new Promise((resolve, reject) => {
    const uploadStream = getDocumentBucket().openUploadStream(
      file.originalname,
      {
        contentType: "application/pdf",
        metadata: { userId: String(userId) },
      },
    );
    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id));
    uploadStream.end(file.buffer);
  });

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    const documentId = new mongoose.Types.ObjectId();
    const fileId = await storeDocumentFile(req.file, req.user._id);
    const fileUrl = `/api/documents/${documentId}/file`;

    // Create document record in database
    let document;
    try {
      document = await Document.create({
        _id: documentId,
        userId: req.user._id,
        title,
        fileName: req.file.originalname,
        filePath: fileUrl,
        fileId,
        fileSize: req.file.size,
        status: "processing",
      });
    } catch (error) {
      await getDocumentBucket().delete(fileId).catch(() => {});
      throw error;
    }

    // Process PDF in background (in production, use a queue like Bull)
    processPDF(document._id, req.file.buffer).catch((err) => {
      console.error("Error processing PDF:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, source) => {
  try {
    const { text } = await extractTextFromPDF(source);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    // Update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream the original PDF from durable MongoDB GridFS storage
// @route   GET /api/documents/:id/file
// @access  Private
export const getDocumentFile = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
      "Cache-Control": "private, max-age=3600",
    });

    if (document.fileId) {
      const downloadStream = getDocumentBucket().openDownloadStream(
        document.fileId,
      );
      downloadStream.once("error", () => {
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: "The stored PDF could not be found",
            statusCode: 404,
          });
        } else {
          res.destroy();
        }
      });
      return downloadStream.pipe(res);
    }

    // Continue supporting local files created before GridFS was introduced.
    const pathname = document.filePath.startsWith("http")
      ? new URL(document.filePath).pathname
      : document.filePath;
    const legacyPath = path.resolve(
      "uploads/documents",
      path.basename(pathname),
    );

    try {
      await fs.access(legacyPath);
      return res.sendFile(legacyPath);
    } catch {
      return res.status(410).json({
        success: false,
        error:
          "The original PDF expired from the previous server storage. Please upload it again once; new uploads are stored permanently.",
        statusCode: 410,
      });
    }
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    if (document.fileId) {
      await getDocumentBucket().delete(document.fileId).catch(() => {});
    } else {
      const pathname = document.filePath.startsWith("http")
        ? new URL(document.filePath).pathname
        : document.filePath;
      const legacyPath = path.resolve(
        "uploads/documents",
        path.basename(pathname),
      );
      await fs.unlink(legacyPath).catch(() => {});
    }

    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
