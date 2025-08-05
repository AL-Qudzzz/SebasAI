
// src/ai/flows/chatWithAI.ts
'use server';
/**
 * @fileOverview A flow to handle AI chat, providing empathetic responses and sentiment analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { analyzeSentiment, type SentimentInput, type SentimentOutput } from './summarize-sentiment';

const ChatWithAIInputSchema = z.object({
  userInput: z.string().describe('The message from the user.'),
  chatHistory: z.string().optional().describe('Optional: The history of the conversation so far, to provide context. Each turn should be on a new line, like "User: Hello\nAI: Hi there!"'),
});
export type ChatWithAIInput = z.infer<typeof ChatWithAIInputSchema>;

const ChatWithAIOutputSchema = z.object({
  response: z.string().describe('The AI\'s empathetic response to the user.'),
  sentiment: z.string().describe('The sentiment of the user\'s input (e.g., positive, negative, neutral).'),
  sentimentScore: z.number().describe('A numerical score for the sentiment (-1 to 1).'),
});
export type ChatWithAIOutput = z.infer<typeof ChatWithAIOutputSchema>;


export async function chatWithAI(input: ChatWithAIInput): Promise<ChatWithAIOutput> {
  return chatWithAIFlow(input);
}

const empatheticChatPrompt = ai.definePrompt({
  name: 'empatheticChatPrompt',
  input: { schema: ChatWithAIInputSchema },
  output: { schema: z.object({ response: z.string() }) },
  prompt: `You are Sebas, an empathetic AI companion. Your goal is to support users in expressing themselves and reflecting on their feelings.
Respond to the user's message in a warm, understanding, and supportive way. Ask open-ended, reflective questions to encourage deeper thought.
Avoid giving direct advice or solutions, especially medical advice. Focus on validating their feelings and guiding them through their thoughts.
{{#if chatHistory}}
Conversation History:
{{{chatHistory}}}
{{/if}}
User's current message: "{{userInput}}"

Your empathetic response:
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

const chatWithAIFlow = ai.defineFlow(
  {
    name: 'chatWithAIFlow',
    inputSchema: ChatWithAIInputSchema,
    outputSchema: ChatWithAIOutputSchema,
  },
  async (input: ChatWithAIInput) => {
    try {
      // Get empathetic response and analyze sentiment in parallel
      const [chatResponse, sentimentAnalysis] = await Promise.all([
        empatheticChatPrompt(input),
        analyzeSentiment({ text: input.userInput })
      ]);

      const aiResponseMessage = chatResponse.output?.response;
      
      if (!aiResponseMessage) {
        console.error('AI did not return a valid chat response.', { output: chatResponse.output });
        throw new Error("Gagal mendapatkan respons dari AI.");
      }

      if (!sentimentAnalysis) {
          console.error('AI did not return a valid sentiment analysis.');
          throw new Error("Gagal menganalisis sentimen.");
      }

      return {
        response: aiResponseMessage,
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score,
      };

    } catch (error) {
      console.error('Error in chatWithAIFlow:', error);
      // Re-throw the error to be caught by the calling action
      throw error;
    }
  }
);
