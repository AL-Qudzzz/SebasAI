
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BookText, Smile, Lightbulb, PenSquare, Sparkles, PieChart, FileText, Target, Users, User as UserIcon } from 'lucide-react';
import { AppLogo } from '@/components/icons/AppLogo';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, 
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/journal', label: 'Journal', icon: BookText },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
  { href: '/goals', label: 'Tujuan Saya', icon: Target },
  { href: '/content', label: 'Personalized Content', icon: Lightbulb },
  { href: '/daily-quote', label: 'Kutipan Harian', icon: PenSquare },
  { href: '/wellness-tip', label: 'Tips Kesejahteraan', icon: Sparkles },
  { href: '/mood-poll', label: 'Jajak Pendapat Suasana Hati', icon: PieChart },
  { href: '/notes', label: 'Catatan Singkat', icon: FileText },
  { href: '/community', label: 'Komunitas', icon: Users },
  { href: '/profile', label: 'Profil Saya', icon: UserIcon },
  // { href: '/settings', label: 'Settings', icon: Settings }, // Future placeholder
];

export default function SidebarContentComponent() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <AppLogo />
          <span className="text-2xl font-headline font-semibold text-sidebar-foreground">Sebas</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
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
                    // Minimal styling here as ui/sidebar handles active/hover states.
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-3" onClick={handleLinkClick}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
