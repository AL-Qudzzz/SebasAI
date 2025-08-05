
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest', // Updated to a model suitable for text generation
});

// Helper function to handle transient API errors with a retry mechanism.
export async function callAIWithRetry<I, O>(
  prompt: (input: I) => Promise<{ output: O | undefined }>,
  input: I,
  retries = 3,
  delay = 1000
): Promise<{ output: O | undefined }> {
  for (let i = 0; i < retries; i++) {
    try {
      return await prompt(input);
    } catch (error: any) {
      // Check for 503 Service Unavailable or similar transient errors
      if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
        if (i < retries - 1) {
          console.warn(`AI service unavailable, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(res => setTimeout(res, delay));
        } else {
          console.error(`AI service failed after ${retries} attempts.`);
          throw new Error('The AI service is currently overloaded. Please try again later.');
        }
      } else {
        // For non-transient errors, fail immediately
        throw error;
      }
    }
  }
  // This should not be reached, but typescript needs a return path.
  throw new Error('AI call failed after all retries.');
}
