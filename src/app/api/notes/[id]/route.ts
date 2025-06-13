
// src/app/api/notes/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

// !!! IMPORTANT: In-memory store. Data will be lost on server restart. !!!
// For production, use a persistent database like Firestore.
// This array needs to be the same instance as in `src/app/api/notes/route.ts`
// This is a simplified example; in a real app, you'd fetch from a shared data source.
// For this demo, we'll re-declare it. This won't work across different serverless function invocations
// if Vercel scales them independently. For a real app, a DB is a must.
let notes: Note[] = []; // Initialize as an empty array

// This is a hack to try and share the notes array for this demo.
// In a real app, notes would come from a database.
if (typeof (global as any).notes === 'undefined') {
    (global as any).notes = notes;
} else {
    notes = (global as any).notes;
}


interface RouteParams {
  params: { id: string };
}

// GET a single note by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const note = notes.find(n => n.id === id);

    if (!note) {
      return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error(`Error fetching note ${params.id}:`, error);
    return NextResponse.json({ error: "Gagal mengambil catatan." }, { status: 500 });
  }
}

// PUT (update) a note by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { content } = await request.json() as { content?: string };

    if (content !== undefined && (typeof content !== 'string' || content.trim() === '')) {
      return NextResponse.json({ error: "Konten catatan tidak boleh kosong jika disediakan." }, { status: 400 });
    }
    
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    }

    const updatedNote = { ...notes[noteIndex]! };
    if (content !== undefined) {
        updatedNote.content = content.trim();
    }
    updatedNote.timestamp = new Date().toISOString(); // Update timestamp on any change

    notes[noteIndex] = updatedNote;
    (global as any).notes = notes; // Update global ref

    console.log("Note updated:", updatedNote);
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error(`Error updating note ${params.id}:`, error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui catatan." }, { status: 500 });
  }
}

// DELETE a note by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Catatan tidak ditemukan." }, { status: 404 });
    }

    notes.splice(noteIndex, 1);
    (global as any).notes = notes; // Update global ref

    console.log("Note deleted:", id);
    return NextResponse.json({ message: "Catatan berhasil dihapus." }, { status: 200 });
    // Or return new Response(null, { status: 204 }); for No Content
  } catch (error) {
    console.error(`Error deleting note ${params.id}:`, error);
    return NextResponse.json({ error: "Gagal menghapus catatan." }, { status: 500 });
  }
}

