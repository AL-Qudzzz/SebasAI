
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized journal prompts.
 *
 * The flow takes the user's current mood and past journal entries as input and returns a personalized journal prompt.
 * It exports:
 *   - generateJournalPrompt: The main function to trigger the flow.
 *   - GenerateJournalPromptInput: The input type for the flow.
 *   - GenerateJournalPromptOutput: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJournalPromptInputSchema = z.object({
  mood: z.string().describe('The current mood of the user.'),
  journalHistory: z.string().describe('The past journal entries of the user.'),
});
export type GenerateJournalPromptInput = z.infer<typeof GenerateJournalPromptInputSchema>;

const GenerateJournalPromptOutputSchema = z.object({
  prompt: z.string().describe('A personalized journal prompt.'),
});
export type GenerateJournalPromptOutput = z.infer<typeof GenerateJournalPromptOutputSchema>;

export async function generateJournalPrompt(input: GenerateJournalPromptInput): Promise<GenerateJournalPromptOutput> {
  return generateJournalPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJournalPromptPrompt',
  input: {schema: GenerateJournalPromptInputSchema},
  output: {schema: GenerateJournalPromptOutputSchema},
  prompt: `You are an AI journaling assistant that helps users overcome writer's block.

  Based on the user's current mood and past journal entries, generate a personalized journal prompt to encourage self-reflection.

  Mood: {{{mood}}}
  Journal History: {{{journalHistory}}}

  Here is a journal prompt for the user:
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const generateJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalPromptFlow',
    inputSchema: GenerateJournalPromptInputSchema,
    outputSchema: GenerateJournalPromptOutputSchema,
  },
  async input => {
    try {
      const response = await prompt(input);
      const output = response.output;

      if (output && typeof output.prompt === 'string' && output.prompt.trim() !== '') {
        return output;
      } else {
        console.error('AI did not return a valid prompt structure from generateJournalPromptFlow. LLM Response:', JSON.stringify(response, null, 2));
        // Return a fallback prompt
        return { prompt: "Take a moment to reflect on your day. What's one thing that stood out to you, good or bad?" };
      }
    } catch (error: any) {
      console.error('Error in generateJournalPromptFlow during AI call:', error);
      if (error.cause) {
        console.error('Cause of error:', error.cause);
      }
      // Return a fallback prompt in case of an exception during the AI call
      return { prompt: "What are you grateful for today? Even small things count." };
    }
  }
);

