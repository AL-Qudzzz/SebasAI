'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';


export interface MoodEntry {
  id: string;
  mood: string; // Adjective
  emoji: string; 
  date: string; // ISO string
}

const availableMoods = [
  { mood: 'Happy', emoji: '😄' },
  { mood: 'Calm', emoji: '😌' },
  { mood: 'Neutral', emoji: '😐' },
  { mood: 'Anxious', emoji: '😟' },
  { mood: 'Sad', emoji: '😢' },
  { mood: 'Energetic', emoji: '⚡️' },
];

export default function MoodTrackerPage() {
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [selectedMood, setSelectedMood] = useState<{ mood: string; emoji: string } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleMoodSelect = (moodChoice: { mood: string; emoji: string }) => {
    setSelectedMood(moodChoice);
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      date: new Date().toISOString(),
    };
    setMoods([...moods, newEntry]);
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
        // Find corresponding emoji for the mood to display in chart
        emoji: availableMoods.find(m => m.mood === name)?.emoji || ''
      }));
      setChartData(data);
    };
    processMoodDataForChart();
  }, [moods]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moodEmoji = availableMoods.find(m => m.mood === label)?.emoji;
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-semibold">{`${moodEmoji || ''} ${label}`}</p>
          <p className="text-sm text-muted-foreground">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-8">
      <PageTitle
        title="Mood Tracker"
        description="How are you feeling today? Log your mood to track your emotional well-being over time."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Log Your Mood</CardTitle>
          <CardDescription>Select an emoji that best represents your current mood.</CardDescription>
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
              <p className="text-lg">You selected: <span className="font-semibold text-primary">{selectedMood.emoji} {selectedMood.mood}</span></p>
              <Button onClick={handleSaveMood} className="mt-4">
                Save Mood
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Mood History</CardTitle>
          <CardDescription>A summary of your logged moods.</CardDescription>
        </CardHeader>
        <CardContent>
          {moods.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No moods logged yet.</p>
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
                  {moods.slice().reverse().map(entry => ( // Newest first
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
