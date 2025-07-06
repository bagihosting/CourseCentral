
import { Shield, Star, Award, Crown, BookUser } from 'lucide-react';
import type { ElementType } from 'react';

export type Rank = {
  title: string;
  icon: ElementType;
  color: string;
};

export function getRank(completedCourses: number, role: 'admin' | 'member' | 'pro' | 'instructor'): Rank {
  if (role === 'admin') {
    return { title: 'Admin', icon: Shield, color: 'text-primary' };
  }
  if (role === 'instructor') {
    return { title: 'Pengajar', icon: BookUser, color: 'text-sky-400' };
  }
   if (role === 'pro') {
    return { title: 'Pro Member', icon: Award, color: 'text-violet-400' };
  }

  if (completedCourses >= 50) {
    return { title: 'Legenda', icon: Crown, color: 'text-amber-400' };
  }
  if (completedCourses >= 20) {
    return { title: 'Mahir', icon: Award, color: 'text-violet-400' };
  }
  if (completedCourses >= 5) {
    return { title: 'Master', icon: Star, color: 'text-cyan-400' };
  }
  return { title: 'Pemula', icon: Star, color: 'text-muted-foreground' };
}
