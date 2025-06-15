
'use client';

import { useState, useEffect } from 'react';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
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

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string; // ISO string
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

type GoalStatus = Goal['status'];

const statusOptions: { value: GoalStatus; label: string }[] = [
  { value: 'pending', label: 'Tertunda' },
  { value: 'in-progress', label: 'Dikerjakan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'on-hold', label: 'Ditahan' },
];

const getStatusBadgeColor = (status: GoalStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50';
    case 'in-progress':
      return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
    case 'completed':
      return 'bg-green-500/20 text-green-700 border-green-500/50';
    case 'on-hold':
      return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};


export default function GoalsPage() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('userGoals', []);
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<GoalStatus>('pending');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setTargetDate(editingGoal.targetDate ? new Date(editingGoal.targetDate) : undefined);
      setStatus(editingGoal.status);
      setIsFormOpen(true);
    } else {
      resetForm();
    }
  }, [editingGoal]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetDate(undefined);
    setStatus('pending');
    setEditingGoal(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Validasi Gagal", description: "Judul tujuan tidak boleh kosong.", variant: "destructive" });
      return;
    }

    const now = new Date().toISOString();

    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
        ? { ...editingGoal, title, description, targetDate: targetDate?.toISOString(), status, updatedAt: now } 
        : g
      ));
      toast({ title: "Sukses", description: "Tujuan berhasil diperbarui." });
    } else {
      // Add new goal
      const newGoal: Goal = {
        id: Date.now().toString(),
        title,
        description,
        targetDate: targetDate?.toISOString(),
        status,
        createdAt: now,
        updatedAt: now,
      };
      setGoals([...goals, newGoal]);
      toast({ title: "Sukses", description: "Tujuan baru berhasil ditambahkan." });
    }
    resetForm();
    setIsFormOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    toast({ title: "Sukses", description: "Tujuan berhasil dihapus." });
  };

  const handleOpenFormForEdit = (goal: Goal) => {
    setEditingGoal(goal);
  };
  
  const handleOpenFormForNew = () => {
    resetForm();
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageTitle
        title="Tujuan Saya"
        description="Tetapkan dan lacak tujuan pribadi Anda untuk kesehatan dan pengembangan diri."
      />

      <div className="flex justify-end mb-4">
        {!isFormOpen && (
          <Button onClick={handleOpenFormForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tujuan Baru
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">
              {editingGoal ? 'Edit Tujuan' : 'Tambah Tujuan Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="goal-title" className="block text-sm font-medium text-foreground mb-1">Judul</label>
                <Input
                  id="goal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Meditasi setiap hari"
                  required
                />
              </div>
              <div>
                <label htmlFor="goal-description" className="block text-sm font-medium text-foreground mb-1">Deskripsi (Opsional)</label>
                <Textarea
                  id="goal-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail tambahan tentang tujuan Anda..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="goal-targetDate" className="block text-sm font-medium text-foreground mb-1">Tanggal Target (Opsional)</label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !targetDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {targetDate ? format(targetDate, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={targetDate}
                            onSelect={setTargetDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label htmlFor="goal-status" className="block text-sm font-medium text-foreground mb-1">Status</label>
                    <Select value={status} onValueChange={(value: GoalStatus) => setStatus(value)}>
                        <SelectTrigger id="goal-status">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                        {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancelForm}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingGoal ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {editingGoal ? 'Simpan Perubahan' : 'Tambah Tujuan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !isFormOpen && (
        <p className="text-muted-foreground text-center py-6">Belum ada tujuan yang ditetapkan. Mulai dengan menambah tujuan baru!</p>
      )}

      {goals.length > 0 && (
        <div className="space-y-4">
          {goals.slice().sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((goal) => (
            <Card key={goal.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-headline text-lg">{goal.title}</CardTitle>
                  <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", getStatusBadgeColor(goal.status))}>
                    {statusOptions.find(s => s.value === goal.status)?.label || goal.status}
                  </span>
                </div>
                {goal.targetDate && (
                  <CardDescription className="text-xs">
                    Target: {format(new Date(goal.targetDate), "PPP")}
                  </CardDescription>
                )}
              </CardHeader>
              {goal.description && (
                <CardContent className="pt-0">
                  <p className="whitespace-pre-wrap text-sm text-foreground/80">{goal.description}</p>
                </CardContent>
              )}
              <CardFooter className="flex justify-end space-x-2 text-xs text-muted-foreground">
                 <span className="mr-auto">Diperbarui: {format(new Date(goal.updatedAt), "P p")}</span>
                <Button variant="outline" size="sm" onClick={() => handleOpenFormForEdit(goal)}>
                  <Edit3 className="mr-1 h-3 w-3" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-3 w-3" /> Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tujuan Anda secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
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

