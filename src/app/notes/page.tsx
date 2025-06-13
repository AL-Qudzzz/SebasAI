
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, PlusCircle, Edit3, Trash2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


interface Note {
  id: string;
  content: string;
  timestamp: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Gagal mengambil catatan: ${response.statusText}`}));
        throw new Error(errData.error || `Gagal mengambil catatan: ${response.statusText}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
        toast({ title: "Validasi Gagal", description: "Konten catatan tidak boleh kosong.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Gagal menambah catatan: ${response.statusText}`}));
        throw new Error(errData.error || `Gagal menambah catatan: ${response.statusText}`);
      }
      setNewNoteContent('');
      fetchNotes(); // Refresh list
      toast({ title: "Sukses", description: "Catatan baru berhasil ditambahkan." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editingContent.trim()) {
        toast({ title: "Validasi Gagal", description: "Konten catatan tidak boleh kosong.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingContent }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Gagal memperbarui catatan: ${response.statusText}`}));
        throw new Error(errData.error || `Gagal memperbarui catatan: ${response.statusText}`);
      }
      setEditingNote(null);
      setEditingContent('');
      fetchNotes(); // Refresh list
      toast({ title: "Sukses", description: "Catatan berhasil diperbarui." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsSubmitting(true); // Can use a specific loading state for delete if preferred
    setError(null);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `Gagal menghapus catatan: ${response.statusText}`}));
        throw new Error(errData.error || `Gagal menghapus catatan: ${response.statusText}`);
      }
      fetchNotes(); // Refresh list
      toast({ title: "Sukses", description: "Catatan berhasil dihapus." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageTitle
        title="Catatan Singkat Saya"
        description="Buat, lihat, dan kelola catatan singkat Anda di sini. Data bersifat sementara dan akan hilang jika server restart."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary">
            {editingNote ? 'Edit Catatan' : 'Tambah Catatan Baru'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingNote ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleAddNote} className="space-y-4">
            <Textarea
              placeholder={editingNote ? "Edit konten catatan Anda..." : "Tulis catatan singkat Anda di sini..."}
              value={editingNote ? editingContent : newNoteContent}
              onChange={(e) => editingNote ? setEditingContent(e.target.value) : setNewNoteContent(e.target.value)}
              rows={4}
              required
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              {editingNote && (
                <Button type="button" variant="outline" onClick={() => { setEditingNote(null); setEditingContent(''); }}>
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingNote ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                {editingNote ? 'Simpan Perubahan' : 'Tambah Catatan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Memuat catatan...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-destructive-foreground">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground/90 text-center">{error}</p>
            <Button onClick={fetchNotes} variant="outline" className="mt-4 mx-auto block">Coba Lagi</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <p className="text-muted-foreground text-center py-6">Belum ada catatan. Tambahkan satu di atas!</p>
      )}

      {!isLoading && !error && notes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-headline text-primary">Daftar Catatan</h2>
          {notes.map((note) => (
            <Card key={note.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap text-foreground/90 mb-2">{note.content}</p>
                <CardDescription className="text-xs">
                  {new Date(note.timestamp).toLocaleString()}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditNote(note)} disabled={isSubmitting}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isSubmitting}>
                      <Trash2 className="mr-1 h-4 w-4" /> Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus catatan Anda secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteNote(note.id)} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Ya, Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
