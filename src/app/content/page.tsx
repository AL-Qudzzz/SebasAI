'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getPersonalizedWellnessContent, type PersonalizedContentState } from './actions';
import type { MoodEntry } from '@/app/mood-tracker/page';
import type { JournalEntry } from '@/app/journal/page';
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react';

export default function PersonalizedContentPage() {
  const [moods] = useLocalStorage<MoodEntry[]>('moodEntries', []);
  const [journalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContentState>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async () => {
    setIsLoading(true);
    setPersonalizedContent({}); // Clear previous content/error

    const latestMood = moods.length > 0 ? moods[moods.length - 1].mood : "";
    const recentJournalText = journalEntries.slice(-3).map(e => `${e.title}\n${e.content}`).join("\n\n---\n\n");
    
    const result = await getPersonalizedWellnessContent(latestMood, recentJournalText);
    setPersonalizedContent(result);
    setIsLoading(false);
  };

  useEffect(() => {
    // Fetch content when the component mounts or when mood/journal data might have changed
    // This initial fetch can be helpful, or you can rely solely on the button click
    fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Consider adding moods & journalEntries if auto-refresh on change is desired

  return (
    <div className="space-y-8">
      <PageTitle
        title="Personalized Wellness"
        description="Discover mindfulness activities and resources tailored to your current state, based on your mood and journal entries."
      />

      <div className="flex justify-center mb-6">
        <Button onClick={fetchContent} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Get New Suggestions
            </>
          )}
        </Button>
      </div>

      {personalizedContent.content && !personalizedContent.error && (
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Lightbulb className="w-6 h-6 mr-2" />
              Your Wellness Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground/90 whitespace-pre-line">
              {personalizedContent.content}
            </div>
          </CardContent>
        </Card>
      )}

      {personalizedContent.error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-destructive-foreground">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground/90">{personalizedContent.error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !personalizedContent.content && !personalizedContent.error && (
         <Card>
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Click the button above to generate personalized wellness suggestions.</p>
                <p className="text-sm text-muted-foreground mt-2">Make sure you have logged your mood or written in your journal for better recommendations.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
