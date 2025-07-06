
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCourse, updateCourse } from '@/actions/courses';
import type { Course } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, Wand2 } from 'lucide-react';
import { generateThumbnailAction, generateDescriptionAction } from '@/actions/ai';
import imageCompression from 'browser-image-compression';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/auth-context';

interface CourseFormProps {
  course?: Course;
}

type FormErrors = {
  title?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [instructor, setInstructor] = useState(course?.instructor || user?.name || '');
  const [price, setPrice] = useState(course?.price || 0);
  const [imageUrl, setImageUrl] = useState(course?.imageUrl || '');
  const [accessLevel, setAccessLevel] = useState<'public' | 'pro'>(course?.accessLevel || 'public');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (title.length < 3) newErrors.title = 'Judul minimal 3 karakter';
    if (description.length < 10) newErrors.description = 'Deskripsi minimal 10 karakter';
    if (price < 0) newErrors.price = 'Harga tidak boleh negatif';
    if (!imageUrl) newErrors.imageUrl = 'Gambar thumbnail harus dibuat.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || !user) {
      toast({ title: 'Gagal', description: 'Harap periksa kembali isian Anda.', variant: 'destructive'});
      return;
    }

    setIsSubmitting(true);
    try {
      // Use user's name as instructor if the field is empty
      const finalInstructor = instructor.trim() === '' ? user.name : instructor;
      const courseData = { title, description, instructor: finalInstructor, price: Number(price), imageUrl, accessLevel };
      
      if (course) {
        await updateCourse(course.id, courseData);
        toast({ title: 'Sukses', description: 'Kursus berhasil diperbarui.' });
        if (user.role === 'instructor') {
          router.push('/dashboard/instructor/courses');
        } else {
          router.push('/dashboard/admin/courses');
        }
      } else {
        const newCourse = await createCourse(courseData, user.id);
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
    
    if ('imageUrl' in result && result.imageUrl) {
        try {
            const dataURItoFile = (dataURI: string, filename: string): File => {
                const arr = dataURI.split(',');
                if (arr.length < 2) throw new Error('Invalid data URI');
                const mimeMatch = arr[0].match(/:(.*?);/);
                if (!mimeMatch || mimeMatch.length < 2) throw new Error('Invalid MIME type');
                const mime = mimeMatch[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            };

            const imageFile = dataURItoFile(result.imageUrl, 'thumbnail.png');
            
            const options = {
                maxSizeMB: 0.2, // Target kompresi 200KB
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: 'image/jpeg',
            };
            const compressedFile = await imageCompression(imageFile, options);

            const reader = new FileReader();
            reader.onloadend = () => {
                const compressedDataUrl = reader.result as string;
                setImageUrl(compressedDataUrl);
                setIsGeneratingThumbnail(false);
                toast({ title: 'Sukses', description: 'Thumbnail berhasil dibuat dan dikompres.' });
            };
            reader.readAsDataURL(compressedFile);

        } catch (compressionError) {
            console.error("Compression Error:", compressionError);
            setImageUrl(result.imageUrl); // Fallback ke gambar asli jika kompresi gagal
            setIsGeneratingThumbnail(false);
            toast({ title: 'Sukses', description: 'Thumbnail berhasil dibuat, namun gagal dikompres.', variant: 'default' });
        }
    } else {
      setIsGeneratingThumbnail(false);
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
          <Input id="instructor" name="instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Default: nama Anda" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp)</Label>
          <Input id="price" name="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-describedby="price-error" />
          {errors.price && <p id="price-error" className="text-sm text-destructive">{errors.price}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Tingkat Akses</Label>
        <RadioGroup
          value={accessLevel}
          onValueChange={(value: 'public' | 'pro') => setAccessLevel(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public" className="font-normal">Publik (Semua Member)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pro" id="pro" />
            <Label htmlFor="pro" className="font-normal">Khusus Pro</Label>
          </div>
        </RadioGroup>
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
