
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { CourseSuggestionOutput } from '@/ai/flows/suggest-courses';
import Link from 'next/link';
import { getAllCourses } from '@/actions/courses';
import { suggestCoursesAction } from '@/actions/ai';

export function AiSuggestions() {
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CourseSuggestionOutput['suggestions']>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest) return;

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const availableCourses = (await getAllCourses()).map(c => ({ id: c.id, title: c.title, description: c.description }));
      const result = await suggestCoursesAction({ interest, courses: availableCourses });
      setSuggestions(result.suggestions);
    } catch (err) {
      setError('Gagal mendapatkan rekomendasi. Coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          Rekomendasi AI
        </CardTitle>
        <CardDescription>
          Beri tahu kami minat Anda, dan kami akan menyarankan kursus yang tepat untuk Anda!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Contoh: 'Pengembangan web backend dengan Node.js'"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !interest}>
            {loading ? <Loader2 className="animate-spin" /> : 'Cari'}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {suggestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="text-accent" />
              Berikut adalah beberapa rekomendasi untuk Anda:
            </h3>
            <ul className="space-y-3 list-disc pl-5">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <Link href={`/dashboard/courses/${suggestion.id}`} className="font-medium text-primary hover:underline">
                    {suggestion.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    