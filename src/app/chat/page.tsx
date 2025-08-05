
'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import PageTitle from '@/components/common/PageTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import ChatMessages from '@/components/chat/ChatMessages';
import { handleUserMessage, type ChatState } from './actions';

const initialState: ChatState = {
  messages: [
    { role: 'ai', content: "Hello! I'm SebasAI. How are you feeling today? Feel free to share anything on your mind." }
  ],
  error: null,
  isLoading: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-label="Send message">
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
    </Button>
  );
}

export default function AIChatPage() {
  const [state, formAction] = useActionState(handleUserMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const prevMessagesLengthRef = useRef(initialState.messages.length);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    if (state.messages.length > prevMessagesLengthRef.current && !state.error) {
      setUserInput('');
    }
    prevMessagesLengthRef.current = state.messages.length;
  }, [state.messages, state.error]);
  

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col"> {/* Increased height */}
      <PageTitle
        title="AI Chat"
        description="Talk with SebasAI. It's here to listen, offer empathetic responses, and help you reflect."
      />

      <div className="flex-1 flex flex-col bg-card shadow-lg rounded-lg overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <ChatMessages messages={state.messages} />
          <div ref={messagesEndRef} />
        </ScrollArea>

        <form
          ref={formRef}
          // @ts-ignore TODO: Fix type for useActionState with form's action prop
          action={formAction}
          className="p-4 border-t bg-background flex items-center space-x-2"
        >
          <Input
            name="userInput"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1"
            autoComplete="off"
            required
          />
          <SubmitButton />
        </form>
        {state.error && <p className="p-2 text-sm text-destructive text-center">{state.error}</p>}
      </div>
    </div>
  );
}
