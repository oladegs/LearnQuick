// Wraps Google Gemini calls for summaries, explanations, chat, flashcards, and quizzes.

import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Make sure the Gemini API key exists before starting.
if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
}

// Create the Gemini client using the API key stored in your .env file.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Keep the Gemini model in one place.
// If Google changes the model later, you only need to update this line.
const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

/**
 * Helper function that sends requests to Gemini.
 *
 * It automatically retries when Gemini temporarily fails
 * because of rate limits (429) or service availability issues (503).
 *
 * @param {Object} params - Parameters sent to Gemini.
 * @param {number} retries - Maximum number of retry attempts.
 * @param {number} baseDelay - Starting retry delay in milliseconds.
 * @returns {Promise<Object>} Gemini response.
 */
const generateContentWithRetry = async (
  params,
  retries = 3,
  baseDelay = 500,
) => {
  let attempt = 0;

  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      attempt += 1;

      const status = err?.status;

      // These errors may be temporary, so retry them.
      const transient = status === 503 || status === 429 || !status;

      // Stop retrying if:
      // 1. We exceeded the retry limit, or
      // 2. The error is not temporary.
      if (attempt > retries || !transient) {
        throw err;
      }

      // Exponential backoff:
      // 500ms -> 1000ms -> 2000ms
      const delay = baseDelay * Math.pow(2, attempt - 1);

      console.warn(
        `Transient Gemini error (status=${status}) — retrying in ${delay}ms (attempt ${attempt}/${retries})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Generate flashcards from text.
 *
 * @param {string} text - Document text.
 * @param {number} count - Number of flashcards to generate.
 * @returns {Promise<Array<{
 *   question: string,
 *   answer: string,
 *   difficulty: string
 * }>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.

Format each flashcard as:
Q: [clear, specific question]
A: [concise, accurate answer]
D: [difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const generatedText = response.text;

    const flashcards = [];

    const cards = generatedText.split("---").filter((card) => card.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("A:")) {
          answer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();

          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({
          question,
          answer,
          difficulty,
        });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions from text.
 *
 * @param {string} text - Document text.
 * @param {number} numQuestions - Number of questions.
 * @returns {Promise<Array<{
 *   question: string,
 *   options: Array,
 *   correctAnswer: string,
 *   explanation: string,
 *   difficulty: string
 * }>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple-choice questions from the following text.

Each question must have four distinct answer options. The correctAnswer value
must exactly match one of those four options. Base every answer on the supplied
text and include a brief explanation.

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        // Structured output removes the fragile dependency on Gemini following
        // custom line prefixes such as "01:" and "C:" exactly.
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              minItems: numQuestions,
              maxItems: numQuestions,
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: { type: "string" },
                  },
                  correctAnswer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: {
                    type: "string",
                    enum: ["easy", "medium", "hard"],
                  },
                },
                required: [
                  "question",
                  "options",
                  "correctAnswer",
                  "explanation",
                  "difficulty",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["questions"],
          additionalProperties: false,
        },
      },
    });

    const parsedResponse = JSON.parse(response.text);
    const generatedQuestions = Array.isArray(parsedResponse)
      ? parsedResponse
      : parsedResponse.questions;

    if (!Array.isArray(generatedQuestions)) {
      throw new Error("Gemini response did not contain a questions array");
    }

    return generatedQuestions
      .map((generatedQuestion) => {
        const question = generatedQuestion?.question?.trim();
        const options = Array.isArray(generatedQuestion?.options)
          ? generatedQuestion.options.map((option) => option?.trim())
          : [];
        const requestedCorrectAnswer =
          generatedQuestion?.correctAnswer?.trim();
        const correctAnswer = options.find(
          (option) =>
            option &&
            requestedCorrectAnswer &&
            option.toLowerCase() === requestedCorrectAnswer.toLowerCase(),
        );
        const difficulty = generatedQuestion?.difficulty?.toLowerCase();

        if (
          !question ||
          options.length !== 4 ||
          options.some((option) => !option) ||
          new Set(options.map((option) => option.toLowerCase())).size !== 4 ||
          !correctAnswer
        ) {
          return null;
        }

        return {
          question,
          options,
          correctAnswer,
          explanation: generatedQuestion?.explanation?.trim() || "",
          difficulty: ["easy", "medium", "hard"].includes(difficulty)
            ? difficulty
            : "medium",
        };
      })
      .filter(Boolean)
      .slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to generate quiz with Gemini. Please try again.");
  }
};

/**
 * Generate a summary of document text.
 *
 * @param {string} text - Document text.
 * @returns {Promise<string>} Generated summary.
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.

Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context.
 *
 * @param {string} question - User's question.
 * @param {Array<{content: string}>} chunks - Relevant document chunks.
 * @returns {Promise<string>} Gemini answer.
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, analyze the context and answer the user's question.

If the answer is not available in the provided context, say so.

Context:
${context}

Question:
${question}

Answer:`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept.
 *
 * @param {string} concept - Concept to explain.
 * @param {string} context - Relevant context.
 * @returns {Promise<string>} Generated explanation.
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.

Provide a clear, educational explanation that is easy to understand.

Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);

    throw new Error("Failed to explain concept");
  }
};
