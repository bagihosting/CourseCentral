import { CourseForm } from '@/components/course-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Ubah Kursus</CardTitle>
          <CardDescription>Perbarui detail kursus Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm course={course} />
        </CardContent>
      </Card>
    </div>
  );
}
