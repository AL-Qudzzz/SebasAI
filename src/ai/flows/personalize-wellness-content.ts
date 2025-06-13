
// src/ai/flows/personalize-wellness-content.ts
'use server';
/**
 * @fileOverview A flow to personalize wellness content based on user mood and journal entries.
 *
 * - personalizeWellnessContent - A function that suggests personalized wellness content.
 * - PersonalizeWellnessContentInput - The input type for the personalizeWellnessContent function.
 * - PersonalizeWellnessContentOutput - The return type for the personalizeWellnessContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeWellnessContentInputSchema = z.object({
  mood: z.string().describe('The current mood of the user.'),
  journalEntries: z.string().describe('The journal entries of the user.'),
});
export type PersonalizeWellnessContentInput = z.infer<
  typeof PersonalizeWellnessContentInputSchema
>;

const PersonalizeWellnessContentOutputSchema = z.object({
  suggestedContent: z
    .string()
    .describe(
      'Personalized wellness content suggestions based on the user mood and journal entries.'
    ),
});
export type PersonalizeWellnessContentOutput = z.infer<
  typeof PersonalizeWellnessContentOutputSchema
>;

export async function personalizeWellnessContent(
  input: PersonalizeWellnessContentInput
): Promise<PersonalizeWellnessContentOutput> {
  return personalizeWellnessContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeWellnessContentPrompt',
  input: {schema: PersonalizeWellnessContentInputSchema},
  output: {schema: PersonalizeWellnessContentOutputSchema},
  prompt: `You are a wellness content curator. Based on the user's current mood and their recent journal entries, suggest personalized wellness content that could be helpful to them.

Mood: {{{mood}}}
Journal Entries: {{{journalEntries}}}

Provide specific suggestions for mindfulness activities, resources, or exercises. Make sure the advice does not constitute medical advice.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const personalizeWellnessContentFlow = ai.defineFlow(
  {
    name: 'personalizeWellnessContentFlow',
    inputSchema: PersonalizeWellnessContentInputSchema,
    outputSchema: PersonalizeWellnessContentOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (output && typeof output.suggestedContent === 'string' && output.suggestedContent.trim() !== '') {
        return output;
      }
      console.error('AI did not return valid content for personalizeWellnessContentFlow. Output:', JSON.stringify(output, null, 2));
      return { suggestedContent: "I'm having a little trouble thinking of suggestions right now. Perhaps try a general mindfulness exercise, like focusing on your breath for a few minutes?" };
    } catch (error: any) {
      console.error('Error in personalizeWellnessContentFlow during AI call:', error);
      if (error.cause) {
        console.error('Cause of error:', error.cause);
      }
      return { suggestedContent: "Sorry, I couldn't generate personalized suggestions at this moment. Please try again later." };
    }
  }
);

