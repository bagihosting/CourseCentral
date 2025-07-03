'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Printer, Award } from 'lucide-react';
import { generateCertificateAction } from '@/actions/ai';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getAllCourses, getSeoSettings } from '@/lib/data';
import type { Course } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AiCertificateGenerator() {
  const [participantName, setParticipantName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [completionDate, setCompletionDate] = useState<Date | undefined>(new Date());
  const [organizerName, setOrganizerName] = useState('');
  const [logoUrl, setLogoUrl] = useState('https://placehold.co/200x80.png');
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setAllCourses(getAllCourses());
    const settings = getSeoSettings();
    setOrganizerName(settings.platformName || 'Scriptify');
  }, []);

  const handleGenerate = async () => {
    if (!participantName || !courseName || !completionDate || !organizerName) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap isi semua kolom untuk membuat sertifikat.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setOutputHtml(null);

    const result = await generateCertificateAction({
      participantName,
      courseName,
      completionDate: format(completionDate, 'dd MMMM yyyy', { locale: id }),
      organizerName,
      logoUrl,
    });
    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Gagal Membuat Sertifikat',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setOutputHtml(result.certificateHtml);
      toast({
        title: 'Sukses!',
        description: 'Sertifikat Anda telah berhasil dibuat oleh AI.',
      });
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current?.srcdoc) {
      toast({ title: 'Gagal', description: 'Tidak ada sertifikat untuk dicetak.', variant: 'destructive' });
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if(printWindow) {
        printWindow.document.write(iframeRef.current.srcdoc);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            // Closing the window after print dialog is a bit tricky, but this is a common approach
            setTimeout(() => {
                 printWindow.close();
            }, 1000);
        };
    } else {
        toast({ title: 'Gagal', description: 'Pop-up window diblokir. Harap izinkan pop-up untuk mencetak.', variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Generator Sertifikat</CardTitle>
                <CardDescription>Isi detail di bawah ini untuk membuat sertifikat baru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="participantName">Nama Lengkap Peserta</Label>
                    <Input id="participantName" value={participantName} onChange={(e) => setParticipantName(e.target.value)} disabled={isLoading} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="courseName">Nama Kursus</Label>
                     <Select onValueChange={setCourseName} value={courseName} disabled={isLoading}>
                        <SelectTrigger id="courseName"><SelectValue placeholder="Pilih kursus" /></SelectTrigger>
                        <SelectContent>
                            {allCourses.map(course => (
                                <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="completionDate">Tanggal Kelulusan</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !completionDate && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {completionDate ? format(completionDate, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={completionDate}
                                onSelect={setCompletionDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="organizerName">Nama Penyelenggara</Label>
                    <Input id="organizerName" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL Logo (Opsional)</Label>
                    <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} disabled={isLoading} />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Buat Sertifikat dengan AI
                </Button>
            </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pratinjau Sertifikat</h3>
            <Button onClick={handlePrint} disabled={!outputHtml || isLoading} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Cetak
            </Button>
        </div>
        <div className="w-full aspect-[1.414] border rounded-lg overflow-hidden bg-muted shadow-inner">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-semibold">AI sedang mendesain sertifikat Anda...</p>
                <p className="text-sm text-muted-foreground">Ini mungkin memerlukan waktu hingga 30 detik.</p>
            </div>
          ) : outputHtml ? (
             <iframe
                ref={iframeRef}
                srcDoc={outputHtml}
                title="Pratinjau Sertifikat"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <Award className="h-10 w-10 text-muted-foreground mb-4"/>
                <p className="font-semibold text-muted-foreground">Pratinjau sertifikat akan muncul di sini.</p>
                <p className="text-sm text-muted-foreground">Isi formulir dan klik tombol 'Buat' untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
