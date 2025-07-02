'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCourse, updateCourse } from '@/lib/data';
import type { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, Wand2 } from 'lucide-react';
import { generateThumbnailAction, generateDescriptionAction } from '@/actions/ai';

interface CourseFormProps {
  course?: Course;
}

type FormErrors = {
  title?: string;
  description?: string;
  instructor?: string;
  price?: string;
  imageUrl?: string;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [price, setPrice] = useState(course?.price || 0);
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || '');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (title.length < 3) newErrors.title = 'Judul minimal 3 karakter';
    if (description.length < 10) newErrors.description = 'Deskripsi minimal 10 karakter';
    if (instructor.length < 3) newErrors.instructor = 'Nama instruktur minimal 3 karakter';
    if (price < 0) newErrors.price = 'Harga tidak boleh negatif';
    if (!imageUrl) newErrors.imageUrl = 'Gambar thumbnail harus dibuat.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      toast({ title: 'Gagal', description: 'Harap periksa kembali isian Anda.', variant: 'destructive'});
      return;
    }

    setIsSubmitting(true);
    try {
      const courseData = { title, description, instructor, price: Number(price), imageUrl, modules: course?.modules || [] };
      if (course) {
        updateCourse(course.id, courseData);
        toast({ title: 'Sukses', description: 'Kursus berhasil diperbarui.' });
        router.push('/dashboard/admin/courses');
      } else {
        const newCourse = createCourse(courseData);
        toast({ title: 'Sukses', description: 'Kursus berhasil dibuat.' });
        router.push(`/dashboard/courses/${newCourse.id}/edit`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan tidak diketahui";
      toast({ title: 'Gagal Menyimpan', description: errorMessage, variant: 'destructive'});
      setIsSubmitting(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!title) {
        toast({ title: 'Gagal', description: 'Judul kursus tidak boleh kosong.', variant: 'destructive'});
        return;
    }
    setIsGeneratingThumbnail(true);
    const result = await generateThumbnailAction(title);
    setIsGeneratingThumbnail(false);

    if ('imageUrl' in result && result.imageUrl) {
      setImageUrl(result.imageUrl);
      toast({ title: 'Sukses', description: 'Thumbnail berhasil dibuat dengan AI.' });
    } else {
      const errorMessage = 'error' in result ? result.error : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleGenerateDescription = async () => {
    if (!title) {
        toast({ title: 'Gagal', description: 'Judul kursus tidak boleh kosong.', variant: 'destructive'});
        return;
    }
    setIsGeneratingDesc(true);
    const result = await generateDescriptionAction(title);
    setIsGeneratingDesc(false);

    if ('description' in result && result.description) {
      setDescription(result.description);
      toast({ title: 'Sukses', description: 'Deskripsi berhasil dibuat dengan AI.' });
    } else {
      const errorMessage = 'error' in result ? result.error : 'Terjadi kesalahan tidak diketahui.';
      toast({ title: 'Gagal', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Kursus</Label>
        <div className="flex items-center gap-2">
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby="title-error"
            className="flex-grow"
            placeholder="Contoh: Belajar Animasi 3D dengan Blender"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateThumbnail}
            disabled={isGeneratingThumbnail || !title}
            className="shrink-0"
          >
            {isGeneratingThumbnail ? <Loader2 className="animate-spin" /> : <Wand2 />}
            <span className="ml-2 hidden sm:inline">Buat AI</span>
          </Button>
        </div>
        {errors.title && <p id="title-error" className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="description">Deskripsi</Label>
            <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDesc || !title}
            >
                {isGeneratingDesc ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                Buat dengan AI
            </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-describedby="description-error"
          rows={5}
        />
        {errors.description && <p id="description-error" className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="instructor">Nama Instruktur</Label>
          <Input id="instructor" name="instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} aria-describedby="instructor-error" />
          {errors.instructor && <p id="instructor-error" className="text-sm text-destructive">{errors.instructor}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input id="price" name="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-describedby="price-error" />
          {errors.price && <p id="price-error" className="text-sm text-destructive">{errors.price}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gambar Thumbnail</Label>
        {imageUrl ? (
          <div className="relative w-full sm:w-60 aspect-video rounded-md overflow-hidden bg-muted border">
            <Image src={imageUrl} alt="Pratinjau Thumbnail" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full sm:w-60 aspect-video rounded-md bg-muted/50 border-2 border-dashed flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center p-2">
              Isi judul dan klik "Buat AI" untuk membuat thumbnail.
            </p>
          </div>
        )}
        <input type="hidden" name="imageUrl" value={imageUrl} />
        {errors.imageUrl && <p id="imageUrl-error" className="text-sm text-destructive">{errors.imageUrl}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : (course ? 'Simpan Perubahan' : 'Buat Kursus')}</Button>
    </form>
  );
}
