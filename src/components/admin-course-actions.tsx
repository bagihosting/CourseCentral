
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { deleteCourse } from '@/actions/courses';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export function AdminCourseActions({ courseId, onCourseDeleted }: { courseId: string; onCourseDeleted: () => void; }) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, setPending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!user) {
        toast({ title: 'Gagal', description: 'Anda harus masuk untuk melakukan tindakan ini.', variant: 'destructive'});
        return;
    }
    setPending(true);
    try {
      await deleteCourse(courseId, user.id);
      toast({
        title: "Sukses",
        description: "Kursus berhasil dihapus.",
        variant: "default",
      });
      onCourseDeleted(); // Notify parent to refresh
      setDeleteDialogOpen(false);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/courses/${courseId}/edit`} className="flex items-center gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              <span>Kelola</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kursus secara permanen beserta semua modul dan pelajarannya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
            {isPending ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
