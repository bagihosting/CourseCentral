import type { Course, User } from '@/types';
import { cookies } from 'next/headers';

// --- DATA ---
// This is a mock database. In a real application, you would use a database.

let users: User[] = [
  { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' },
  { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' },
];

let courses: Course[] = [
  {
    id: 'c1',
    title: 'Pengembangan Web Modern dengan React & Next.js',
    description: 'Pelajari cara membangun aplikasi web full-stack yang cepat dan modern dari awal hingga deployment.',
    instructor: 'Budi Santoso',
    price: 550000,
    imageUrl: 'https://placehold.co/600x400.png',
    modules: [
      { id: 'm1', title: 'Pendahuluan React', lessons: [{ id: 'l1', title: 'Setup Lingkungan', type: 'text', downloadable: true }, { id: 'l2', title: 'Dasar-dasar JSX', type: 'video' }] },
      { id: 'm2', title: 'Manajemen State', lessons: [{ id: 'l3', title: 'useState & useEffect', type: 'video' }] },
    ],
  },
  {
    id: 'c2',
    title: 'Dasar-dasar Desain UI/UX untuk Pemula',
    description: 'Kuasai prinsip-prinsip desain fundamental untuk menciptakan antarmuka yang indah dan ramah pengguna.',
    instructor: 'Citra Lestari',
    price: 450000,
    imageUrl: 'https://placehold.co/600x400.png',
    modules: [
       { id: 'm1', title: 'Prinsip Desain', lessons: [{ id: 'l1', title: 'Teori Warna', type: 'text', downloadable: true }, { id: 'l2', title: 'Tipografi', type: 'text', downloadable: true }] },
    ],
  },
  {
    id: 'c3',
    title: 'Machine Learning dengan Python',
    description: 'Bangun model machine learning cerdas menggunakan library Python populer seperti Scikit-learn dan TensorFlow.',
    instructor: 'Dewi Anggraini',
    price: 750000,
    imageUrl: 'https://placehold.co/600x400.png',
    modules: [
      { id: 'm1', title: 'Pengenalan', lessons: [{ id: 'l1', title: 'Instalasi Python & Jupyter', type: 'zip', downloadable: true }] },
    ],
  },
  {
    id: 'c4',
    title: 'Manajemen Proyek Agile & Scrum',
    description: 'Tingkatkan efisiensi tim Anda dengan menguasai metodologi pengembangan perangkat lunak Agile dan Scrum.',
    instructor: 'Eko Prasetyo',
    price: 0,
    imageUrl: 'https://placehold.co/600x400.png',
    modules: [],
  },
];


// --- API FUNCTIONS ---

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getUser(): Promise<{ id: string, name: string, role: 'admin' | 'member', avatarUrl: string } | null> {
    await delay(100);
    const userCookie = cookies().get('user_session')?.value;
    if (!userCookie) return null;
    const user = users.find(u => u.role === userCookie);
    return user || null;
}

export async function getAllUsers(): Promise<User[]> {
  await delay(100);
  return users;
}

export async function getAllCourses(): Promise<Course[]> {
  await delay(100);
  return courses;
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  await delay(100);
  return courses.find(c => c.id === id);
}

export async function createCourse(data: Omit<Course, 'id' | 'modules'>): Promise<Course> {
  await delay(500);
  const newCourse: Course = {
    ...data,
    id: `c${Date.now()}`,
    modules: [],
  };
  courses.push(newCourse);
  return newCourse;
}

export async function updateCourse(id: string, data: Omit<Course, 'id' | 'modules'>): Promise<Course | null> {
  await delay(500);
  const courseIndex = courses.findIndex(c => c.id === id);
  if (courseIndex === -1) {
    return null;
  }
  courses[courseIndex] = { ...courses[courseIndex], ...data };
  return courses[courseIndex];
}

export async function deleteCourse(id: string): Promise<void> {
  await delay(500);
  courses = courses.filter(c => c.id !== id);
}
