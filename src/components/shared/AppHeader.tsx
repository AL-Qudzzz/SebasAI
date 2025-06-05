
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from './ThemeToggleButton';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" /> {/* Visible on mobile to toggle sidebar */}
      
      <div className="flex-1">
        {/* Placeholder for other header content, e.g., breadcrumbs or global search */}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        {/* Placeholder for User Avatar/Menu */}
        {/* <UserNav /> */}
      </div>
    </header>
  );
}
