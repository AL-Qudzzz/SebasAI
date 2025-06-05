'use client';

import { cn } from '@/lib/utils';
import { User, Bot, AlertTriangle, Smile, Meh, Frown } from 'lucide-react';
import type { ChatState } from '@/app/chat/actions';
import { Badge } from '@/components/ui/badge';

interface ChatMessagesProps {
  messages: ChatState['messages'];
}

const getSentimentIcon = (sentiment?: string, score?: number) => {
  if (!sentiment) return null;
  if (score && score > 0.3) return <Smile className="w-4 h-4 text-green-500" />;
  if (score && score < -0.3) return <Frown className="w-4 h-4 text-red-500" />;
  return <Meh className="w-4 h-4 text-yellow-500" />;
};


export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="space-y-4 flex-1 overflow-y-auto p-4 rounded-lg border bg-card">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start space-x-3 max-w-xl',
            msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
          )}
        >
          <div
            className={cn(
              'p-2 rounded-full',
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            )}
          >
            {msg.role === 'user' ? <User className="w-5 h-5" /> : msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 text-destructive" />}
          </div>
          <div
            className={cn(
              'p-3 rounded-lg shadow-sm',
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
              msg.role === 'system' ? 'bg-destructive/20 text-destructive-foreground border border-destructive' : ''
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            {msg.role === 'user' && msg.sentiment && (
              <div className="mt-1 flex items-center space-x-1">
                {getSentimentIcon(msg.sentiment, msg.sentimentScore)}
                <Badge variant="outline" className="text-xs capitalize">
                  {msg.sentiment}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
