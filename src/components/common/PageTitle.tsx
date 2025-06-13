import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
}

export default function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl sm:text-4xl font-headline font-semibold text-primary mb-2">{title}</h1>
      {description && <p className="text-base sm:text-lg text-muted-foreground">{description}</p>}
    </div>
  );
}
