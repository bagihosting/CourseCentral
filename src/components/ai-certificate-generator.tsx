
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Printer, Award, Download, Save } from 'lucide-react';
import { generateCertificateAction } from '@/actions/ai';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getAllCourses } from '@/actions/courses';
import { getAllUsers } from '@/actions/users';
import { getSeoSettings, getLandingPageSettings } from '@/actions/settings';
import { awardCertificateToUser } from '@/actions/requests';
import type { Course, User } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import DOMPurify from 'isomorphic-dompurify';

export function AiCertificateGenerator() {
  const [participantName, setParticipantName] = useState('');
  const [selectedUserId, setSelectedUserId] = useLocalStorage('ai_cert_selectedUserId', '');
  const [courseName, setCourseName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useLocalStorage('ai_cert_selectedCourseId', '');
  const [completionDate, setCompletionDate] = useState<Date | undefined>(new Date());
  const [organizerName, setOrganizerName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outputHtml, setOutputHtml] = useLocalStorage<string | null>('ai_cert_outputHtml', null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchInitialData() {
        const [coursesData, usersData, seoSettingsData, landingPageSettingsData] = await Promise.all([
            getAllCourses(),
            getAllUsers(),
            getSeoSettings(),
            getLandingPageSettings()
        ]);
        
        const filteredUsers = usersData.filter(u => u.role !== 'admin');
        
        setAllCourses(coursesData);
        setAllUsers(filteredUsers);
        setOrganizerName(seoSettingsData.platformName || 'Scriptify');
        setLogoUrl(landingPageSettingsData.logoUrl || 'https://placehold.co/200x80.png');

        const initialUser = filteredUsers.find(u => u.id === selectedUserId);
        if(initialUser) setParticipantName(initialUser.name);

        const initialCourse = coursesData.find(c => c.id === selectedCourseId);
        if(initialCourse) setCourseName(initialCourse.title);
    }
    fetchInitialData();
  }, [selectedUserId, selectedCourseId]);

  const handleGenerate = async () => {
    if (!participantName || !courseName || !completionDate || !organizerName || !selectedCourseId) {
      toast({
        title: 'Input Diperlukan',
        description: 'Harap pilih peserta, kursus, dan isi semua kolom untuk membuat sertifikat.',
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
      courseId: selectedCourseId
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
        description: 'Pratinjau sertifikat Anda telah berhasil dibuat oleh AI.',
      });
    }
  };

  const handleSaveForMember = async () => {
    if (!outputHtml || !selectedUserId || !selectedCourseId) {
      toast({ title: 'Gagal', description: 'Pilih pengguna, kursus, dan buat pratinjau sertifikat terlebih dahulu.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
        const cleanHtml = DOMPurify.sanitize(outputHtml, { WHOLE_DOCUMENT: true });
        await awardCertificateToUser(selectedUserId, selectedCourseId, cleanHtml);
        toast({
            title: 'Sukses!',
            description: 'Sertifikat telah disimpan untuk member dan akan muncul di halaman "Sertifikat Saya" mereka.',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
        toast({
            title: 'Gagal Menyimpan',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsSaving(false);
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
            setTimeout(() => {
                 printWindow.close();
            }, 1000);
        };
    } else {
        toast({ title: 'Gagal', description: 'Pop-up window diblokir. Harap izinkan pop-up untuk mencetak.', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    if (!outputHtml || !participantName) {
      toast({ title: 'Gagal', description: 'Tidak ada sertifikat untuk diunduh.', variant: 'destructive' });
      return;
    }
    
    try {
        const blob = new Blob([outputHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `sertifikat-${participantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: 'Mengunduh...',
            description: 'File sertifikat Anda telah mulai diunduh.',
        });
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            description: 'Tidak dapat membuat file untuk diunduh.',
            variant: 'destructive',
        });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Generator Sertifikat Manual</CardTitle>
                <CardDescription>Buat sertifikat untuk member secara manual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="participantName">Nama Peserta</Label>
                    <Select onValueChange={(v) => {
                        const user = allUsers.find(u => u.id === v);
                        if (user) {
                            setSelectedUserId(user.id);
                            setParticipantName(user.name);
                        }
                    }} value={selectedUserId} disabled={isLoading || isSaving}>
                        <SelectTrigger id="participantName"><SelectValue placeholder="Pilih peserta" /></SelectTrigger>
                        <SelectContent>
                            {allUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name} ({user.username})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="courseName">Nama Kursus</Label>
                     <Select onValueChange={(v) => {
                         const course = allCourses.find(c => c.id === v);
                         if(course) {
                            setSelectedCourseId(course.id);
                            setCourseName(course.title);
                         }
                     }} value={selectedCourseId} disabled={isLoading || isSaving}>
                        <SelectTrigger id="courseName"><SelectValue placeholder="Pilih kursus" /></SelectTrigger>
                        <SelectContent>
                            {allCourses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
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
                            disabled={isLoading || isSaving}
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
                    <Input id="organizerName" value={organizerName} disabled />
                     <p className="text-xs text-muted-foreground">Diambil dari Pengaturan Global. Logo juga akan diambil dari pengaturan.</p>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading || isSaving} className="w-full">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Buat Pratinjau Sertifikat
                </Button>
            </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pratinjau Sertifikat</h3>
             <div className="flex items-center gap-2">
                <Button onClick={handlePrint} disabled={!outputHtml} variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak
                </Button>
                 <Button onClick={handleDownload} disabled={!outputHtml} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh
                </Button>
            </div>
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
                srcDoc={DOMPurify.sanitize(outputHtml, { WHOLE_DOCUMENT: true })}
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
         <Button onClick={handleSaveForMember} disabled={!outputHtml || isSaving || isLoading} className="w-full" size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Sertifikat untuk Member
        </Button>
      </div>
    </div>
  );
}

    