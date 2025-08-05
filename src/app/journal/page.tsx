
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageTitle from '@/components/common/PageTitle';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import JournalEntriesList from '@/components/journal/JournalEntriesList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getNewJournalPrompt, type JournalPromptState } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import type { MoodEntry } from '@/app/mood-tracker/page';
import { getJournalEntries, saveJournalEntry, updateJournalEntryInFirestore, deleteJournalEntryFromFirestore, type JournalEntry } from '@/services/firestoreService';
import { getMoodEntries } from '@/services/firestoreService'; // Moods also from firestore
import { useToast } from "@/hooks/use-toast";

export default function JournalPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [aiPrompt, setAiPrompt] = useState<JournalPromptState>({});
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  const fetchJournalData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingEntries(true);
    const [userEntries, userMoods] = await Promise.all([
      getJournalEntries(currentUser.uid),
      getMoodEntries(currentUser.uid)
    ]);
    setEntries(userEntries);
    setMoods(userMoods);
    setIsLoadingEntries(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchJournalData();
    } else {
      // Clear data if user logs out
      setEntries([]);
      setMoods([]);
      setIsLoadingEntries(false);
    }
  }, [currentUser, fetchJournalData]);

  const handleSaveEntry = async (entryData: Omit<JournalEntry, 'id' | 'date'>) => {
    if (!currentUser) {
      toast({ title: "Error", description: "Anda harus login untuk menyimpan entri.", variant: "destructive" });
      return;
    }

    if (editingEntry) {
      const success = await updateJournalEntryInFirestore(currentUser.uid, editingEntry.id, entryData);
      if (success) {
        toast({ title: "Sukses", description: "Entri berhasil diperbarui." });
        setEditingEntry(null);
      } else {
        toast({ title: "Error", description: "Gagal memperbarui entri.", variant: "destructive" });
      }
    } else {
      const newEntry: Omit<JournalEntry, 'id'> = {
        ...entryData,
        date: new Date().toISOString(),
      };
      const newId = await saveJournalEntry(currentUser.uid, newEntry as JournalEntry); // Pass as full entry for saving
      if (newId) {
        toast({ title: "Sukses", description: "Entri baru berhasil disimpan." });
      } else {
        toast({ title: "Error", description: "Gagal menyimpan entri baru.", variant: "destructive" });
      }
    }
    // Refresh list after saving
    await fetchJournalData();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Anda yakin ingin menghapus entri ini?')) {
      const success = await deleteJournalEntryFromFirestore(currentUser.uid, id);
      if (success) {
        toast({ title: "Sukses", description: "Entri berhasil dihapus." });
        if (editingEntry?.id === id) {
          setEditingEntry(null);
        }
        await fetchJournalData(); // Refresh list
      } else {
        toast({ title: "Error", description: "Gagal menghapus entri.", variant: "destructive" });
      }
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const fetchNewPrompt = useCallback(async () => {
    if (!currentUser) {
        toast({ title: "Info", description: "Login untuk mendapatkan prompt yang dipersonalisasi.", variant: "default" });
        return;
    }
    setIsLoadingPrompt(true);
    setAiPrompt({}); // Clear previous prompt/error
    const latestMood = moods.length > 0 ? moods[0].mood : "neutral"; // moods are newest first
    const recentHistory = entries.slice(0, 3).map(e => e.content).join("\n\n---\n\n");
    const promptState = await getNewJournalPrompt(latestMood, recentHistory);
    setAiPrompt(promptState);
    setIsLoadingPrompt(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, entries, moods]); // Dependencies are correct

  useEffect(() => {
    if (currentUser) {
      fetchNewPrompt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Fetch only once on user login, not on every data change

  return (
    <div className="space-y-8">
      <PageTitle
        title="Journal"
        description="Catat pemikiran, perasaan, dan pengalaman harian Anda. Gunakan prompt AI untuk menginspirasi tulisan Anda."
      />

      {currentUser && aiPrompt.prompt && !aiPrompt.error && (
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
      
      {currentUser && (
        <Button onClick={fetchNewPrompt} disabled={isLoadingPrompt} className="mb-6">
          {isLoadingPrompt ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mendapatkan Prompt Baru...
            </>
          ) : (
            'Dapatkan Prompt Jurnal Baru'
          )}
        </Button>
      )}
      
      {currentUser ? (
        <>
          <JournalEntryForm onSave={handleSaveEntry} entryToEdit={editingEntry} />
          {isLoadingEntries ? (
             <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <JournalEntriesList entries={entries} onDelete={handleDeleteEntry} onEdit={handleEditEntry} />
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          Silakan login untuk memulai jurnal Anda dan menyimpan entri Anda.
        </div>
      )}
    </div>
  );
}
