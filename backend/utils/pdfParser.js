// Reads uploaded PDF files and extracts their text so AI features can use the content.
import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file
 * @param {string | Buffer | Uint8Array} source - PDF path or in-memory data
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (source) => {
  try {
    const dataBuffer =
      typeof source === "string" ? await fs.readFile(source) : source;
    // pdf-parse expects a Uint8Array, not a Buffer
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
