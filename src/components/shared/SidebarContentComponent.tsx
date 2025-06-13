
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BookText, Smile, Lightbulb, PenSquare, Sparkles, PieChart, FileText } from 'lucide-react'; // Added FileText
import { AppLogo } from '@/components/icons/AppLogo';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
  { href: '/content', label: 'Personalized Content', icon: Lightbulb },
  { href: '/daily-quote', label: 'Kutipan Harian', icon: PenSquare },
  { href: '/wellness-tip', label: 'Tips Kesejahteraan', icon: Sparkles }, 
  { href: '/mood-poll', label: 'Jajak Pendapat Suasana Hati', icon: PieChart },
  { href: '/notes', label: 'Catatan Singkat', icon: FileText }, // New Feature: Quick Notes
  // { href: '/settings', label: 'Settings', icon: Settings }, // Future placeholder
];

export default function SidebarContentComponent() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4"> {/* Added padding to match old SidebarNav style */}
        <div className="flex items-center space-x-2">
          <AppLogo />
          {/* The text "Zara" might be hidden when collapsed to icon, handled by Sidebar component styles */}
          <span className="text-2xl font-headline font-semibold text-primary-foreground">Zara</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2"> {/* Added padding to match old SidebarNav style */}
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className={cn(
                    // Copied active/hover styles from old SidebarNav for consistency if needed,
                    // but ui/sidebar should handle this well.
                    // Keeping this minimal as ui/sidebar has its own active/hover states.
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      {/* SidebarFooter can be added here if needed */}
    </>
  );
}
