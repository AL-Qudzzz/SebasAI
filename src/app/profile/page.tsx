
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PageTitle from '@/components/common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Loader2, User as UserIcon } from 'lucide-react'; // Added UserIcon
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, loadingAuthState, logout } = useAuth();

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/auth');
    }
  }, [currentUser, loadingAuthState, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, show a toast notification for logout failure
    }
  };

  if (loadingAuthState) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat data pengguna...</p>
      </div>
    );
  }

  if (!currentUser) {
    // This state should ideally be brief due to the useEffect redirect
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Profil Saya"
        description="Kelola informasi akun Anda di sini."
      />
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 ring-2 ring-primary ring-offset-2 ring-offset-background">
             <Image 
                src={`https://placehold.co/100x100.png?text=${currentUser.email?.[0]?.toUpperCase() ?? 'U'}`} 
                alt={currentUser.email ?? 'User Avatar'} 
                width={100}
                height={100}
                priority
                className="aspect-square h-full w-full"
                data-ai-hint="profile avatar"
              />
            <AvatarFallback>{currentUser.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{currentUser.email}</CardTitle>
          <CardDescription>Pengguna Terdaftar Sebas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {/* Add more profile information here in the future */}
          {/* Example: <p>Username: {currentUser.displayName || 'Not set'}</p> */}
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
