'use server';

import { generateJournalPrompt, type GenerateJournalPromptInput, type GenerateJournalPromptOutput } from '@/ai/flows/generate-journal-prompt';

export interface JournalPromptState {
  prompt?: string;
  error?: string | null;
}

export async function getNewJournalPrompt(
  mood: string,
  journalHistory: string
): Promise<JournalPromptState> {
  if (!mood && !journalHistory) {
    // Provide a generic prompt if no data is available
     return { prompt: "What's on your mind today? Write about anything that feels important right now.", error: null };
  }

  try {
    const input: GenerateJournalPromptInput = {
      mood: mood || "neutral", // Default mood if not provided
      journalHistory: journalHistory || "No previous entries.", // Default history if not provided
    };
    const output: GenerateJournalPromptOutput = await generateJournalPrompt(input);
    return { prompt: output.prompt, error: null };
  } catch (error) {
    console.error('Error generating journal prompt:', error);
    return { error: 'Failed to generate a new journal prompt. Please try again.' };
  }
}
