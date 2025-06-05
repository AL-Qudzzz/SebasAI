'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BookText, Smile, Lightbulb, Settings } from 'lucide-react';
import { AppLogo } from '@/components/icons/AppLogo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
  { href: '/content', label: 'Personalized Content', icon: Lightbulb },
  // { href: '/settings', label: 'Settings', icon: Settings }, // Future placeholder
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col space-y-4 border-r border-sidebar-border shadow-md">
      <div className="flex items-center space-x-2 p-2 mb-4">
        <AppLogo />
        <h1 className="text-2xl font-headline font-semibold text-primary-foreground">MyBot</h1>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ease-in-out',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-active-foreground font-semibold shadow-inner'
                    : 'hover:bg-sidebar-hover hover:text-sidebar-hover-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
