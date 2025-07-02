'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Course, User } from '@/types';
import { getCourseSuggestions } from '@/actions/ai';
import { Loader2, Wand2 } from 'lucide-react';
import Link from 'next/link';

type AiSuggestionsProps = {
  user: User;
};

export function AiSuggestions({ user }: AiSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const { toast } = useToast();

  const handleSuggestCourses = async () => {
    setLoading(true);
    setSuggestions([]);
    const result = await getCourseSuggestions({
      userSkills: user.skills,
      courseProgress: user.courseProgress,
    });
    setLoading(false);

    if (result.success) {
      setSuggestions(result.courses ?? []);
      if((result.courses ?? []).length === 0) {
        toast({
            title: "No new suggestions",
            description: "You're all caught up! Check back later for more course recommendations.",
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <span>AI Course Suggestions</span>
        </CardTitle>
        <CardDescription>
          Get personalized course recommendations based on your skills and progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button onClick={handleSuggestCourses} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Suggest Courses'}
          </Button>
          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Recommended for you:</h4>
              <ul className="list-disc space-y-1 pl-5">
                {suggestions.map((course) => (
                  <li key={course.id}>
                    <Link href={`/dashboard/courses/#${course.id}`} className="text-sm text-primary hover:underline">
                        {course.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
