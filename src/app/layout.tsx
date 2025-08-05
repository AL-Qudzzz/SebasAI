
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppHeader from '@/components/shared/AppHeader';
import SidebarContentComponent from '@/components/shared/SidebarContentComponent';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';


export const metadata: Metadata = {
  title: 'SebasAI - Your Personal AI Companion',
  description: 'AI-powered chat, journaling, and wellness support.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Sidebar collapsible="icon">
                  <SidebarContentComponent />
                </Sidebar>
                <SidebarInset className="bg-background flex flex-col flex-1">
                  <AppHeader />
                  <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <div className="h-full">
                    {children}
                    </div>
                  </main>
                </SidebarInset>
              </div>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
