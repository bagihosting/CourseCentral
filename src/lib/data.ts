import type { User } from '@/types';

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    role: 'member',
    membershipDuration: 12,
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['React', 'TypeScript', 'Node.js'],
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'admin',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Manajemen Proyek', 'Desain Sistem', 'CI/CD'],
  },
  {
    id: 'user-3',
    name: 'Sam Lee',
    email: 'sam.l@example.com',
    role: 'member',
    membershipDuration: 6,
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Python', 'Ilmu Data', 'Machine Learning'],
  },
];

// Mock API functions
export async function getUserById(id: string): Promise<User | undefined> {
  return USERS.find((user) => user.id === id);
}
