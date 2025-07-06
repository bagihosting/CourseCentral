
import type { Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Gem } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="aspect-video relative">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint="course topic"
            />
            {course.accessLevel === 'pro' && (
                <Badge className="absolute top-2 right-2 bg-violet-600 text-white border-violet-600 shadow-md">
                    <Gem className="mr-1.5 h-3 w-3" />
                    Pro
                </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
          <CardTitle className="text-lg leading-tight mb-2">{course.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">{course.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Oleh {course.instructor}</p>
            <Badge variant="secondary" className="font-bold">
              {course.price === 0 ? 'Gratis' : `Rp${course.price.toLocaleString('id-ID')}`}
            </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
