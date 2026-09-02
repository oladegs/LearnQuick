import dotenv from 'dotenv';
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chatWithContext,
  explainConcept,
} from './utils/geminiService.js';

dotenv.config();

const run = async () => {
  try {
    console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

    const sampleText = `Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight into chemical energy.
It occurs mainly in the chloroplasts of plant cells.`;

    console.log('\n--- generateSummary ---');
    const summary = await generateSummary(sampleText);
    console.log(summary.split('\n').slice(0,5).join('\n'));

    console.log('\n--- generateFlashcards ---');
    const cards = await generateFlashcards(sampleText, 3);
    console.log(cards);

    console.log('\n--- generateQuiz ---');
    const quiz = await generateQuiz(sampleText, 2);
    console.log(quiz);

    console.log('\n--- chatWithContext ---');
    const chunks = [{ content: sampleText }];
    const answer = await chatWithContext('What is photosynthesis?', chunks);
    console.log(answer);

    console.log('\n--- explainConcept ---');
    const explanation = await explainConcept('photosynthesis', sampleText);
    console.log(explanation.split('\n').slice(0,8).join('\n'));

    console.log('\nAll tests completed successfully.');
  } catch (err) {
    console.error('One or more tests failed:', err);
    process.exitCode = 1;
  }
};

run();
