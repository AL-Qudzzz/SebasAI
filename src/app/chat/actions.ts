'use server';

import { chatWithAI, type ChatWithAIInput, type ChatWithAIOutput } from '@/ai/flows/chatWithAI';

export interface ChatState {
  messages: { role: 'user' | 'ai' | 'system'; content: string; sentiment?: string; sentimentScore?: number }[];
  error?: string | null;
  isLoading: boolean;
}

export async function handleUserMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const userInput = formData.get('userInput') as string;

  if (!userInput) {
    return { 
      ...prevState, 
      error: 'Message cannot be empty.',
      isLoading: false,
    };
  }
  
  const userMessage = { role: 'user' as const, content: userInput };
  const newMessages = [...prevState.messages, userMessage];

  // Prepare chat history for the AI, keeping it concise
  const historyForAI = newMessages
    .slice(-6) // Take last 6 messages (3 user, 3 AI) for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n');

  try {
    const aiInput: ChatWithAIInput = { userInput, chatHistory: historyForAI };
    const aiOutput: ChatWithAIOutput = await chatWithAI(aiInput);

    const aiMessage = {
      role: 'ai' as const,
      content: aiOutput.response,
    };
    
    // Update the last user message with sentiment
    const updatedMessages = newMessages.map((msg, index) => {
        if (index === newMessages.length - 1 && msg.role === 'user') {
            return { ...msg, sentiment: aiOutput.sentiment, sentimentScore: aiOutput.sentimentScore };
        }
        return msg;
    });

    return {
      messages: [...updatedMessages, aiMessage],
      error: null,
      isLoading: false,
    };
  } catch (error) {
    console.error('Error processing AI chat:', error);
    const systemMessage = { role: 'system' as const, content: 'Sorry, something went wrong. Please try again.' };
    return {
      messages: [...newMessages, systemMessage],
      error: 'Failed to get response from AI.',
      isLoading: false,
    };
  }
}
