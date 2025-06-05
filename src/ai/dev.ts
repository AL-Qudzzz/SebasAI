import { config } from 'dotenv';
config();

import '@/ai/flows/personalize-wellness-content.ts';
import '@/ai/flows/generate-journal-prompt.ts';
import '@/ai/flows/summarize-sentiment.ts';
import '@/ai/flows/chatWithAI.ts';
