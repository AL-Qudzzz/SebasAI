'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Edit3 } from 'lucide-react';
import type { JournalEntry } from '@/app/journal/page';

interface JournalEntriesListProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: JournalEntry) => void;
}

export default function JournalEntriesList({ entries, onDelete, onEdit }: JournalEntriesListProps) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No journal entries yet. Start writing!</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline text-primary mb-4">Your Entries</h2>
      <Accordion type="single" collapsible className="w-full">
        {entries.slice().reverse().map((entry) => ( // Display newest first
          <AccordionItem value={entry.id} key={entry.id}>
            <Card className="mb-2 shadow-sm transition-shadow hover:shadow-md">
              <AccordionTrigger className="w-full p-4 text-left hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle className="text-xl font-headline">{entry.title}</CardTitle>
                    <CardDescription>{new Date(entry.date).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0">
                  <p className="whitespace-pre-wrap mb-4 text-foreground/90">{entry.content}</p>
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => onEdit(entry)}>
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
