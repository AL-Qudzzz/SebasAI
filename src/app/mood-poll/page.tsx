
// src/app/mood-poll/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface PollOption {
  id: string;
  text: string;
  count: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  lastReset: string; // YYYY-MM-DD
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

export default function MoodPollPage() {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVotedToday, setHasVotedToday] = useLocalStorage<boolean>(`moodPollVoted-${new Date().toISOString().split('T')[0]}`, false);
  const [localStorageKey, setLocalStorageKey] = useState(`moodPollVoted-${new Date().toISOString().split('T')[0]}`);

  const fetchPollData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mood-poll');
      if (!response.ok) throw new Error("Gagal mengambil data jajak pendapat.");
      const data: PollData = await response.json();
      setPollData(data);
      const currentKey = `moodPollVoted-${data.lastReset}`;
      setLocalStorageKey(currentKey);
      // Re-check voting status if the poll day has changed
      const votedStatus = localStorage.getItem(currentKey);
      setHasVotedToday(votedStatus === 'true');

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPollData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = async () => {
    if (!selectedOptionId || !pollData) return;
    if (hasVotedToday) {
      setError("Anda sudah memberikan suara untuk hari ini.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/mood-poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOptionId }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({error: "Gagal mengirimkan suara."}));
         throw new Error(errorData.error || "Gagal mengirimkan suara.");
      }
      const updatedPollData: PollData = await response.json();
      setPollData(updatedPollData);
      setHasVotedToday(true); // Mark as voted for today using the correct key
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim suara.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-sm text-muted-foreground">{`Jumlah: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="space-y-8">
      <PageTitle
        title="Jajak Pendapat Suasana Hati Harian"
        description="Bagaimana perasaan Anda hari ini? Ikuti jajak pendapat singkat ini."
      />

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive bg-destructive/10 w-full">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-destructive-foreground">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground/90 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {pollData && !isLoading && !error && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{pollData.question}</CardTitle>
              <CardDescription>Pilih salah satu opsi di bawah ini.</CardDescription>
            </CardHeader>
            <CardContent>
              {hasVotedToday ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-medium text-muted-foreground">Terima kasih telah memberikan suara hari ini!</p>
                  <p className="text-sm text-muted-foreground">Anda dapat melihat hasilnya di samping atau kembali besok untuk jajak pendapat baru.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleVote(); }} className="space-y-6">
                  <RadioGroup value={selectedOptionId || undefined} onValueChange={setSelectedOptionId} className="space-y-2">
                    {pollData.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button type="submit" disabled={isSubmitting || !selectedOptionId} className="w-full">
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Kirim Suara
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">Hasil Jajak Pendapat Saat Ini</CardTitle>
              <CardDescription>Berikut adalah agregasi suara untuk hari ini.</CardDescription>
            </CardHeader>
            <CardContent>
              {pollData.options.reduce((sum, opt) => sum + opt.count, 0) === 0 ? (
                 <p className="text-muted-foreground text-center py-10">Belum ada suara yang masuk hari ini.</p>
              ) : (
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pollData.options} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis dataKey="text" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }} />
                      <Bar dataKey="count"  radius={[0, 4, 4, 0]}>
                        {pollData.options.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]!} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
