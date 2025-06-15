
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PageTitle from '@/components/common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, MessageSquareText } from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  const { currentUser, loadingAuthState } = useAuth();

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/auth');
    }
  }, [currentUser, loadingAuthState, router]);

  if (loadingAuthState) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat halaman komunitas...</p>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Komunitas Sebas"
        description="Terhubung, berbagi, dan dapatkan dukungan dari pengguna lain."
      />
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <MessageSquareText className="w-16 h-16 text-primary mb-4" />
          <CardTitle className="text-2xl">Fitur Komunitas Segera Hadir!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="text-lg">
            Kami sedang bekerja keras untuk membangun ruang yang aman dan suportif bagi Anda untuk terhubung dengan pengguna Sebas lainnya.
            Nantikan pembaruan selanjutnya!
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
