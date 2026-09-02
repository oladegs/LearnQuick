import dotenv from 'dotenv';
import { generateSummary } from './utils/geminiService.js';

dotenv.config();

const run = async () => {
  try {
    console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
    const text = 'Node.js testing of Gemini API key. This is a short test.';
    const summary = await generateSummary(text);
    console.log('Summary result:', summary);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

run();
