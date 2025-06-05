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
});

const generateJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateJournalPromptFlow',
    inputSchema: GenerateJournalPromptInputSchema,
    outputSchema: GenerateJournalPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
