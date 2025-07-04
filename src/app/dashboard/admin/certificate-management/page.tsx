
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCertificateRequests, getCourseById } from '@/lib/data';
import type { PopulatedCertificateRequest, Course, Lesson } from '@/types';
import { CheckCircle, Package, FileText, Award, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AiCertificateGenerator } from '@/components/ai-certificate-generator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type CompletionInfo = PopulatedCertificateRequest & {
    downloadableText: string;
};

export default function DownloadManagementPage() {
    const [completions, setCompletions] = useState<CompletionInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const approvedRequests = getCertificateRequests().filter(req => req.status === 'approved');
        
        const completionDetails = approvedRequests.map(req => {
            const course = getCourseById(req.courseId);
            let pdfCount = 0;
            let zipCount = 0;

            if (course) {
                course.modules.forEach(module => {
                    module.lessons.forEach(lesson => {
                        if (lesson.downloadable) {
                            if (lesson.type === 'text') pdfCount++;
                            if (lesson.type === 'zip') zipCount++;
                        }
                    });
                });
            }

            const parts = [];
            if (pdfCount > 0) parts.push(`${pdfCount} PDF`);
            if (zipCount > 0) parts.push(`${zipCount} ZIP`);
            const downloadableText = parts.join(', ') || 'Tidak ada';

            return {
                ...req,
                downloadableText,
            };
        });

        setCompletions(completionDetails);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </CardHeader>
                    <CardContent>
                        <div className="w-full space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle /> Monitor Penyelesaian Kursus</CardTitle>
                    <CardDescription>
                        Lacak member yang telah menyelesaikan kursus dan mendapatkan sertifikat. Ini adalah indikator unduhan materi yang telah diaktifkan untuk mereka.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Kursus Selesai</TableHead>
                                <TableHead>Tanggal Selesai</TableHead>
                                <TableHead>Materi Tersedia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Belum ada member yang menyelesaikan kursus.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                completions.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={item.userAvatar} alt={item.userName} />
                                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{item.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.courseTitle}</TableCell>
                                        <TableCell>{item.approvedAt ? format(new Date(item.approvedAt), 'dd MMM yyyy', { locale: id }) : '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {item.downloadableText.includes('PDF') && <FileText className="h-4 w-4" />}
                                                {item.downloadableText.includes('ZIP') && <Package className="h-4 w-4" />}
                                                <span>{item.downloadableText}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-6 w-6 text-primary" />
                        Kirim Unduhan & Sertifikat Manual
                    </CardTitle>
                    <CardDescription>
                        Gunakan alat ini untuk memberikan akses unduhan dan sertifikat kepada member secara manual. Dengan memberikan sertifikat untuk suatu kursus, member tersebut akan otomatis bisa mengunduh semua materi terkait dari halaman 'Unduhan' mereka. Ini berguna untuk kasus khusus atau untuk memberikan akses tanpa menunggu penyelesaian kursus.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AiCertificateGenerator />
                </CardContent>
            </Card>
        </div>
    )
}
