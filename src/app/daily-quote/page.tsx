// src/app/daily-quote/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DailyQuote {
  id: number;
  text: string;
  author: string;
}

interface ApiResponse {
  quote?: DailyQuote;
  error?: string;
}

// Inline SVG for a quote icon, as QuoteIcon is not in lucide-react
const CustomQuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mr-2 text-primary">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2H12c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c.25 0 .25.25.25.5v.5c0 1-.75 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
  </svg>
);

export default function DailyQuotePage() {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setIsLoading(true);
    setError(null);
    setQuote(null); // Clear previous quote
    try {
      const response = await fetch('/api/daily-quote');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.quote) {
        setQuote(data.quote);
      } else {
        throw new Error("Tidak ada kutipan ditemukan dalam respons API.");
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil kutipan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a quote when the page loads initially
  useEffect(() => {
    fetchQuote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="space-y-8">
      <PageTitle
        title="Kutipan Harian"
        description="Dapatkan kutipan inspirasional untuk mencerahkan harimu."
      />

      <div className="flex justify-center">
        <Button onClick={fetchQuote} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengambil...
            </>
          ) : (
            'Dapatkan Kutipan Baru'
          )}
        </Button>
      </div>

      {isLoading && !error && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive bg-destructive/10 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-destructive-foreground">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground/90 text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {quote && !isLoading && !error && (
        <Card className="shadow-xl bg-card max-w-2xl mx-auto rounded-lg overflow-hidden">
          <CardHeader className="bg-primary/10 p-6">
            <CardTitle className="font-headline text-2xl text-primary flex items-center justify-center">
              <CustomQuoteIcon />
              Kutipan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 p-8">
            <blockquote className="text-2xl italic text-foreground/90 leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="text-md text-muted-foreground font-medium">- {quote.author}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !quote && !error && (
         <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Klik tombol di atas untuk mengambil kutipan harian.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
