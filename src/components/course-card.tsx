import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types';
import { Clock, User } from 'lucide-react';
import Link from 'next/link';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col" id={course.id}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={course.imageUrl}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint="online course"
          />
        </div>
        <div className="p-6">
            <Badge variant="secondary" className="mb-2">{course.category}</Badge>
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">{course.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>{course.instructor}</span>
        </div>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{course.duration}</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="#">Lihat Kursus</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
