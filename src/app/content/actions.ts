'use server';

import { personalizeWellnessContent, type PersonalizeWellnessContentInput, type PersonalizeWellnessContentOutput } from '@/ai/flows/personalize-wellness-content';

export interface PersonalizedContentState {
  content?: string;
  error?: string | null;
}

export async function getPersonalizedWellnessContent(
  mood: string,
  journalEntries: string
): Promise<PersonalizedContentState> {
  if (!mood && !journalEntries) {
     return { content: "To get personalized content, please log your mood or write in your journal first.", error: null };
  }

  try {
    const input: PersonalizeWellnessContentInput = {
      mood: mood || "Not specified",
      journalEntries: journalEntries || "No recent journal entries.",
    };
    const output: PersonalizeWellnessContentOutput = await personalizeWellnessContent(input);
    return { content: output.suggestedContent, error: null };
  } catch (error) {
    console.error('Error fetching personalized content:', error);
    return { error: 'Failed to fetch personalized content. Please try again.' };
  }
}
