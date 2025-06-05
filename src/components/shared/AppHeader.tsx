
'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react'; // Removed UserCircle as it wasn't used

export default function AppHeader() {
  const { currentUser, loadingAuthState, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // router.push('/auth'); // Optional: redirect to login after logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error (e.g., show a toast)
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      
      {/* Any other left-aligned or center-aligned header content could go here or before the SidebarTrigger */}

      <div className="flex items-center gap-2 ml-auto"> {/* This group is pushed to the right */}
        <ThemeToggleButton />
        {loadingAuthState ? (
          <Button variant="ghost" size="icon" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
          </Button>
        ) : currentUser ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {currentUser.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
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

