
// src/app/wellness-tip/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react';

interface WellnessTipResponse {
  tip?: string;
  error?: string;
}

export default function WellnessTipPage() {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTip = async () => {
    setIsLoading(true);
    setError(null);
    setTip(null);
    try {
      const response = await fetch('/api/wellness-tip');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data: WellnessTipResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.tip) {
        setTip(data.tip);
      } else {
        throw new Error("Tidak ada tips ditemukan dalam respons API.");
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil tips. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <PageTitle
        title="Tips Kesejahteraan Harian"
        description="Dapatkan inspirasi singkat untuk meningkatkan kesejahteraan Anda setiap hari."
      />

      <div className="flex justify-center">
        <Button onClick={fetchTip} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengambil Tips...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Dapatkan Tips Baru
            </>
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

      {tip && !isLoading && !error && (
        <Card className="shadow-xl bg-card max-w-2xl mx-auto rounded-lg overflow-hidden">
          <CardHeader className="bg-accent/10 p-6">
            <CardTitle className="font-headline text-2xl text-accent-foreground flex items-center justify-center">
              <Lightbulb className="w-7 h-7 mr-3" />
              Tips Untukmu Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 p-8">
            <p className="text-xl text-foreground/90 leading-relaxed">
              {tip}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !tip && !error && (
         <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Klik tombol di atas untuk mendapatkan tips kesejahteraan.</p>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
