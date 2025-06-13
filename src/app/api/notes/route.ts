
// src/app/api/notes/route.ts
import { NextResponse } from 'next/server';

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

// !!! IMPORTANT: In-memory store. Data will be lost on server restart. !!!
// For production, use a persistent database like Firestore.
let notes: Note[] = []; // Initialize as an empty array

// This is a hack to try and share the notes array for this demo.
// In a real app, notes would come from a database.
if (typeof (global as any).notes === 'undefined') {
    (global as any).notes = notes;
} else {
    notes = (global as any).notes;
}

// GET all notes
export async function GET(request: Request) {
  try {
    // Sort notes by timestamp, newest first (optional)
    const sortedNotes = [...notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json(sortedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Gagal mengambil catatan." }, { status: 500 });
  }
}

// POST a new note (Create)
export async function POST(request: Request) {
  try {
    const { content } = await request.json() as { content: string };

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: "Konten catatan tidak boleh kosong." }, { status: 400 });
    }

    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 15), // Simple unique ID
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    notes.push(newNote);
    (global as any).notes = notes; // Update global ref
    console.log("New note created:", newNote);
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) { // Opening curly brace added here
    console.error("Error creating note:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat catatan." }, { status: 500 });
  }
}

