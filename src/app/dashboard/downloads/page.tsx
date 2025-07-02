import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllCourses } from '@/lib/data';
import { Download, FileText, Film, Archive } from 'lucide-react';
import Link from 'next/link';

export default async function DownloadsPage() {
  const courses = await getAllCourses();

  const getIcon = (type: 'pdf' | 'zip' | 'video') => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      case 'zip':
        return <Archive className="h-5 w-5 text-muted-foreground" />;
      case 'video':
        return <Film className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Downloads</h1>
        <p className="text-muted-foreground">Access all your downloadable course materials here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
          <CardDescription>
            A comprehensive list of all materials from your enrolled courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead className="w-[100px] text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.flatMap((course) =>
                course.materials.map((material, index) => (
                  <TableRow key={`${course.id}-${index}`}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getIcon(material.type)}
                        <span>{material.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={material.url} download>
                          <Download className="h-5 w-5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
