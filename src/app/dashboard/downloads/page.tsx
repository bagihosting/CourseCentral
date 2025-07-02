import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllCourses } from '@/lib/data';
import { Download, FileText, Film, Archive } from 'lucide-react';
import Link from 'next/link';

export default async function DownloadsPage() {
  const courses = await getAllCourses();
  const allDownloads = courses.flatMap(course => 
    course.modules.flatMap(module => 
      module.lessons
        .filter(lesson => lesson.downloadable)
        .map(lesson => ({
          courseTitle: course.title,
          lessonTitle: lesson.title,
          type: lesson.type
        }))
    )
  );

  const getIcon = (type: 'video' | 'text' | 'zip') => {
    switch (type) {
      case 'video': return <Film className="h-5 w-5 text-muted-foreground" />;
      case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'zip': return <Archive className="h-5 w-5 text-muted-foreground" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Unduhan</h1>
        <p className="text-muted-foreground">Akses semua materi kursus yang dapat diunduh di sini.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Materi Kursus</CardTitle>
          <CardDescription>
            {allDownloads.length > 0
              ? 'Berikut adalah daftar semua materi yang dapat Anda unduh.'
              : 'Tidak ada materi yang tersedia untuk diunduh saat ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allDownloads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pelajaran</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDownloads.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.lessonTitle}</TableCell>
                    <TableCell>{item.courseTitle}</TableCell>
                    <TableCell className="capitalize flex items-center gap-2">
                      {getIcon(item.type)}
                      {item.type}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="#" className="text-primary hover:underline flex items-center justify-end gap-2">
                        <Download className="h-4 w-4" /> Unduh
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Saat Anda mendaftar kursus dengan materi yang dapat diunduh, materi tersebut akan muncul di sini.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
