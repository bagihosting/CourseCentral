'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getApprovedCertificatesForUser, PopulatedCertificateRequest } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function MyCertificatesPage() {
  const { user, loading: userLoading } = useAuth();
  const [certificates, setCertificates] = useState<PopulatedCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setCertificates(getApprovedCertificatesForUser(user.id));
    }
    setLoading(false);
  }, [user]);

  const handleDownload = (htmlContent: string | undefined, participantName: string, courseName: string) => {
    if (!htmlContent) {
      toast({ title: 'Gagal', description: 'Konten sertifikat tidak ditemukan.', variant: 'destructive' });
      return;
    }
    
    try {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `sertifikat-${participantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${courseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download failed: ', err);
        toast({
            title: 'Gagal Mengunduh',
            description: 'Tidak dapat membuat file untuk diunduh.',
            variant: 'destructive',
        });
    }
  };

  if (loading || userLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/2" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sertifikat Saya</h1>
        <p className="text-muted-foreground">Berikut adalah daftar semua sertifikat yang telah Anda peroleh.</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center gap-4">
            <Award className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Belum Ada Sertifikat</h2>
            <p className="text-muted-foreground">Selesaikan kursus dan ajukan sertifikat, maka akan muncul di sini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{cert.courseTitle}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4"/> 
                  Disetujui pada {cert.approvedAt ? format(new Date(cert.approvedAt), 'dd MMMM yyyy', { locale: id }) : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleDownload(cert.certificateHtml, cert.userName, cert.courseTitle)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Sertifikat
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
