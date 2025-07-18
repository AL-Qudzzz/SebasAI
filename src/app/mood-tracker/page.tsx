
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { MoodEntry } from '@/services/firestoreService';
import { saveMoodEntry, getMoodEntries } from '@/services/firestoreService';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

const availableMoods = [
  { mood: 'Happy', emoji: '😄' },
  { mood: 'Calm', emoji: '😌' },
  { mood: 'Neutral', emoji: '😐' },
  { mood: 'Anxious', emoji: '😟' },
  { mood: 'Sad', emoji: '😢' },
  { mood: 'Energetic', emoji: '⚡️' },
];

export default function MoodTrackerPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<{ mood: string; emoji: string } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMoods = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const userMoods = await getMoodEntries(currentUser.uid);
    setMoods(userMoods);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchMoods();
    } else {
      setIsLoading(false);
      setMoods([]); // Clear moods if user logs out
    }
  }, [currentUser, fetchMoods]);


  const handleMoodSelect = (moodChoice: { mood: string; emoji: string }) => {
    setSelectedMood(moodChoice);
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    if (!currentUser) {
      toast({ title: "Error", description: "Anda harus login untuk menyimpan mood.", variant: "destructive" });
      return;
    }
    
    const newEntry: Omit<MoodEntry, 'id'> = {
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      date: new Date().toISOString(),
    };

    const newId = await saveMoodEntry(currentUser.uid, newEntry as MoodEntry);
    
    if(newId) {
      toast({ title: "Sukses", description: "Mood berhasil disimpan!" });
      await fetchMoods(); // Refresh moods from firestore
    } else {
      toast({ title: "Error", description: "Gagal menyimpan mood.", variant: "destructive" });
    }
    
    setSelectedMood(null); // Reset selection
  };

  useEffect(() => {
    const processMoodDataForChart = () => {
      const moodCounts: { [key: string]: number } = {};
      moods.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });
      
      const data = Object.entries(moodCounts).map(([name, value]) => ({
        name,
        count: value,
        emoji: availableMoods.find(m => m.mood === name)?.emoji || ''
      }));
      setChartData(data);
    };
    if (moods.length > 0) {
      processMoodDataForChart();
    } else {
      setChartData([]);
    }
  }, [moods]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moodEmoji = availableMoods.find(m => m.mood === label)?.emoji;
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-semibold">{`${moodEmoji || ''} ${label}`}</p>
          <p className="text-sm text-muted-foreground">{`Jumlah: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-8">
      <PageTitle
        title="Mood Tracker"
        description="Bagaimana perasaan Anda hari ini? Catat suasana hati Anda untuk melacak kesehatan emosional Anda dari waktu ke waktu."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Catat Mood Anda</CardTitle>
          <CardDescription>Pilih emoji yang paling mewakili suasana hati Anda saat ini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {availableMoods.map((moodChoice) => (
              <Button
                key={moodChoice.mood}
                variant="outline"
                onClick={() => handleMoodSelect(moodChoice)}
                className={cn(
                  'p-3 sm:p-4 h-auto flex flex-col items-center space-y-1 transition-all duration-200 ease-in-out transform hover:scale-105',
                  selectedMood?.mood === moodChoice.mood ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-md' : 'border-border'
                )}
              >
                <span className="text-3xl sm:text-4xl">{moodChoice.emoji}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{moodChoice.mood}</span>
              </Button>
            ))}
          </div>
          {selectedMood && (
            <div className="text-center">
              <p className="text-lg">Anda memilih: <span className="font-semibold text-primary">{selectedMood.emoji} {selectedMood.mood}</span></p>
              <Button onClick={handleSaveMood} className="mt-4">
                Simpan Mood
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Riwayat Mood</CardTitle>
          <CardDescription>Ringkasan suasana hati yang telah Anda catat.</CardDescription>
        </CardHeader>
        <CardContent>
          {!currentUser ? (
             <p className="text-muted-foreground text-center py-4">Login untuk melihat riwayat mood Anda.</p>
          ) : moods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Belum ada mood yang dicatat.</p>
          ) : (
            <>
              {chartData.length > 0 && (
                 <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="emoji" position="top" fill="hsl(var(--foreground))" fontSize={14} dy={-5} />
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
              )}
              <ScrollArea className="h-64 mt-6 pr-4">
                <ul className="space-y-3">
                  {moods.slice().map(entry => ( // Firestore already returns sorted
                    <li key={entry.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                      <div>
                        <span className="text-2xl mr-3">{entry.emoji}</span>
                        <span className="font-medium">{entry.mood}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
