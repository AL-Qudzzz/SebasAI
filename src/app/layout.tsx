import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import SidebarNav from '@/components/shared/SidebarNav';
import { AppLogo } from '@/components/icons/AppLogo';

export const metadata: Metadata = {
  title: 'MyBot - Your Personal AI Companion',
  description: 'AI-powered chat, journaling, and wellness support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen">
          <SidebarNav />
          <main className="flex-1 p-6 overflow-auto bg-background">
            <div className="container mx-auto max-w-7xl">
             {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
