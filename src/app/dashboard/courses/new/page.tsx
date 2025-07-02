import { CourseForm } from '@/components/course-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Kursus Baru</CardTitle>
          <CardDescription>Isi detail kursus baru Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
