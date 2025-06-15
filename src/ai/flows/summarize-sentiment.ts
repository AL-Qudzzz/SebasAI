// Summarize sentiment flow implementation
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing the sentiment of text.
 *
 * The flow takes text as input and returns a sentiment analysis result.
 * It exports:
 * - analyzeSentiment - A function to analyze sentiment of text.
 * - SentimentInput - The input type for the analyzeSentiment function.
 * - SentimentOutput - The output type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze for sentiment.'),
});
export type SentimentInput = z.infer<typeof SentimentInputSchema>;

const SentimentOutputSchema = z.object({
  sentiment: z
    .string()
    .describe(
      'The sentiment of the text, such as positive, negative, or neutral.'
    ),
  score: z.number().describe('A numerical score representing the sentiment.'),
});
export type SentimentOutput = z.infer<typeof SentimentOutputSchema>;

export async function analyzeSentiment(input: SentimentInput): Promise<SentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: SentimentInputSchema},
  output: {schema: SentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text and provide a sentiment label (positive, negative, or neutral) and a numerical score between -1 and 1, where -1 is very negative and 1 is very positive.\n\nText: {{{text}}}`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: SentimentInputSchema,
    outputSchema: SentimentOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        console.error('Sentiment analysis prompt did not return an output for input:', input.text);
        return { sentiment: 'neutral', score: 0 }; // Fallback
      }
      return output;
    } catch (error) {
      console.error('Error in analyzeSentimentFlow during AI call for input "'+ input.text +'":', error);
      return { sentiment: 'neutral', score: 0 }; // Fallback in case of any error
    }
  }
);

