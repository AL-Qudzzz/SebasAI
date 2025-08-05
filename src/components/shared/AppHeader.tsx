
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, User as UserIcon, LogOut, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AppHeader() {
  const { currentUser, loadingAuthState, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error (e.g., show a toast)
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggleButton />
        {loadingAuthState ? (
          <Button variant="ghost" size="icon" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
          </Button>
        ) : currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/32x32.png?text=${currentUser.email?.[0]?.toUpperCase() ?? 'U'}`} alt={currentUser.email ?? 'User Avatar'} data-ai-hint="profile avatar" />
                  <AvatarFallback>{currentUser.email?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Profil</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Lihat Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" asChild aria-label="Login">
            <Link href="/auth">
              <LogIn className="h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

