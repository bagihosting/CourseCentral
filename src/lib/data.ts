import type { User, Course } from '@/types';

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    role: 'member',
    membershipDuration: 12,
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['React', 'TypeScript', 'Node.js'],
    courseProgress: {
      'course-1': 75,
      'course-3': 20,
    },
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'admin',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Project Management', 'System Design', 'CI/CD'],
    courseProgress: {
      'course-1': 100,
      'course-2': 100,
      'course-4': 90,
    },
  },
  {
    id: 'user-3',
    name: 'Sam Lee',
    email: 'sam.l@example.com',
    role: 'member',
    membershipDuration: 6,
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Python', 'Data Science', 'Machine Learning'],
    courseProgress: {
      'course-5': 50,
      'course-6': 10,
    },
  },
];

export const COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'TypeScript Lanjutan untuk Pengembangan Web Modern',
    description: 'Pelajari fitur-fitur TypeScript secara mendalam seperti generic, decorator, dan tipe-tipe lanjutan.',
    instructor: 'Jane Doe',
    duration: '12 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Pengembangan Web',
    materials: [
      { name: 'Materi Slide', url: '#', type: 'pdf' },
      { name: 'File Proyek', url: '#', type: 'zip' },
    ],
  },
  {
    id: 'course-2',
    title: 'Next.js 14: Dari Nol hingga Mahir',
    description: 'Bangun aplikasi full-stack dengan fitur-fitur terbaru Next.js, termasuk App Router dan Server Actions.',
    instructor: 'John Smith',
    duration: '20 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Pengembangan Web',
    materials: [
      { name: 'Buku Saku E-book', url: '#', type: 'pdf' },
      { name: 'Contoh Kode', url: '#', type: 'zip' },
    ],
  },
  {
    id: 'course-3',
    title: 'Dasar-Dasar Desain UI/UX',
    description: 'Pelajari prinsip-prinsip desain yang berpusat pada pengguna, mulai dari wireframing hingga prototipe dengan ketepatan tinggi.',
    instructor: 'Emily White',
    duration: '15 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Desain',
    materials: [
      { name: 'Template Figma', url: '#', type: 'zip' },
      { name: 'Daftar Bacaan', url: '#', type: 'pdf' },
    ],
  },
  {
    id: 'course-4',
    title: 'Menguasai Docker dan Kubernetes',
    description: 'Deploy, kelola, dan skalakan aplikasi menggunakan teknologi kontainerisasi.',
    instructor: 'Chris Green',
    duration: '25 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'DevOps',
    materials: [
        { name: 'Video Perkuliahan', url: '#', type: 'video'},
        { name: 'File Konfigurasi', url: '#', type: 'zip' },
    ]
  },
  {
    id: 'course-5',
    title: 'Python untuk Ilmu Data dan ML',
    description: 'Pengantar analisis data, visualisasi, dan machine learning dengan Python.',
    instructor: 'Patel Singh',
    duration: '30 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Ilmu Data',
    materials: [
        { name: 'Notebook Jupyter', url: '#', type: 'zip' },
        { name: 'Kumpulan Dataset', url: '#', type: 'zip' },
    ]
  },
  {
    id: 'course-6',
    title: 'Pengantar GenAI dengan Genkit',
    description: 'Pelajari dasar-dasar membangun aplikasi bertenaga AI menggunakan Genkit dari Google.',
    instructor: 'Ada Lovelace',
    duration: '10 jam',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'AI/ML',
    materials: [
        { name: 'PDF Konsep Inti', url: '#', type: 'pdf' },
    ]
  },
];

// Mock API functions
export async function getUserById(id: string): Promise<User | undefined> {
  return USERS.find((user) => user.id === id);
}

export async function getAllCourses(): Promise<Course[]> {
  return COURSES;
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  return COURSES.find((course) => course.id === id);
}

export async function getCoursesByIds(ids: string[]): Promise<Course[]> {
  return COURSES.filter((course) => ids.includes(course.id));
}
