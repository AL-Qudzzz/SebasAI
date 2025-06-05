'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import JournalEntriesList from '@/components/journal/JournalEntriesList';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getNewJournalPrompt, type JournalPromptState } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import type { MoodEntry } from '@/app/mood-tracker/page'; // Import MoodEntry type

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [moods] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [aiPrompt, setAiPrompt] = useState<JournalPromptState>({});
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  const handleSaveEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>) => {
    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? { ...editingEntry, ...entryData, date: new Date().toISOString() } : e));
      setEditingEntry(null);
    } else {
      const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now().toString(), // Simple ID generation
        date: new Date().toISOString(),
      };
      setEntries([...entries, newEntry]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
      if (editingEntry?.id === id) {
        setEditingEntry(null);
      }
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const fetchNewPrompt = async () => {
    setIsLoadingPrompt(true);
    setAiPrompt({}); // Clear previous prompt/error
    const latestMood = moods.length > 0 ? moods[moods.length - 1].mood : "neutral";
    const recentHistory = entries.slice(-3).map(e => e.content).join("\n\n---\n\n");
    const promptState = await getNewJournalPrompt(latestMood, recentHistory);
    setAiPrompt(promptState);
    setIsLoadingPrompt(false);
  };

  useEffect(() => {
    // Fetch an initial prompt when the page loads
    fetchNewPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="space-y-8">
      <PageTitle
        title="Journal"
        description="Record your thoughts, feelings, and daily experiences. Use AI-generated prompts to inspire your writing."
      />

      {aiPrompt.prompt && !aiPrompt.error && (
        <Card className="mb-6 bg-accent/30 border-accent shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-accent-foreground flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-accent-foreground/80" />
              Journal Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent-foreground/90">{aiPrompt.prompt}</p>
          </CardContent>
        </Card>
      )}
      {aiPrompt.error && (
        <p className="text-destructive text-sm mb-4">Error fetching prompt: {aiPrompt.error}</p>
      )}
      
      <Button onClick={fetchNewPrompt} disabled={isLoadingPrompt} className="mb-6">
        {isLoadingPrompt ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting New Prompt...
          </>
        ) : (
          'Get New Journal Prompt'
        )}
      </Button>
      
      <JournalEntryForm onSave={handleSaveEntry} entryToEdit={editingEntry} />
      
      <JournalEntriesList entries={entries} onDelete={handleDeleteEntry} onEdit={handleEditEntry} />
    </div>
  );
}
