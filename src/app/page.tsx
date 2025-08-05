import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PageTitle from '@/components/common/PageTitle';
import { MessageSquare, BookText, Smile, Lightbulb, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    title: 'AI Chat',
    description: 'Engage in empathetic conversations and explore your thoughts.',
    href: '/chat',
    icon: MessageSquare,
    dataAiHint: 'chat conversation',
  },
  {
    title: 'Journal',
    description: 'Reflect on your day with AI-powered prompts and private entries.',
    href: '/journal',
    icon: BookText,
    dataAiHint: 'journal writing',
  },
  {
    title: 'Mood Tracker',
    description: 'Log your daily mood and gain insights into your emotional patterns.',
    href: '/mood-tracker',
    icon: Smile,
    dataAiHint: 'mood tracking',
  },
  {
    title: 'Personalized Content',
    description: 'Discover wellness activities tailored to your current mood and needs.',
    href: '/content',
    icon: Lightbulb,
    dataAiHint: 'wellness yoga',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Welcome to Sebas"
        description="Your personal AI companion for mental wellness and self-reflection. Explore the features below to get started."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.title} className="group">
            <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
                  Go to {feature.title} <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
