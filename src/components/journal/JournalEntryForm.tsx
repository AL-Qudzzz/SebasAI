'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/app/journal/page';

interface JournalEntryFormProps {
  onSave: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  entryToEdit?: JournalEntry | null;
}

export default function JournalEntryForm({ onSave, entryToEdit }: JournalEntryFormProps) {
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [content, setContent] = useState(entryToEdit?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      // Basic validation, consider using react-hook-form for more complex scenarios
      alert('Title and content cannot be empty.');
      return;
    }
    onSave({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          {entryToEdit ? 'Edit Entry' : 'New Journal Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="journal-title" className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <Input
              id="journal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Today's Reflections"
              className="w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="journal-content" className="block text-sm font-medium text-foreground mb-1">
              Content
            </label>
            <Textarea
              id="journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your day, thoughts, or feelings..."
              className="w-full min-h-[200px]"
              required
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            {entryToEdit ? 'Save Changes' : 'Save Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
