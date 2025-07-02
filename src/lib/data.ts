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
    title: 'Advanced TypeScript for Modern Web Dev',
    description: 'Deep dive into TypeScript features like generics, decorators, and advanced types.',
    instructor: 'Jane Doe',
    duration: '12 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Web Development',
    materials: [
      { name: 'Course Slides', url: '#', type: 'pdf' },
      { name: 'Project Files', url: '#', type: 'zip' },
    ],
  },
  {
    id: 'course-2',
    title: 'Next.js 14: From Zero to Hero',
    description: 'Build full-stack applications with the latest features of Next.js, including App Router and Server Actions.',
    instructor: 'John Smith',
    duration: '20 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Web Development',
    materials: [
      { name: 'E-book Companion', url: '#', type: 'pdf' },
      { name: 'Example Codebase', url: '#', type: 'zip' },
    ],
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user-centric design, from wireframing to high-fidelity prototyping.',
    instructor: 'Emily White',
    duration: '15 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Design',
    materials: [
      { name: 'Figma Templates', url: '#', type: 'zip' },
      { name: 'Reading List', url: '#', type: 'pdf' },
    ],
  },
  {
    id: 'course-4',
    title: 'Mastering Docker and Kubernetes',
    description: 'Deploy, manage, and scale applications using containerization technologies.',
    instructor: 'Chris Green',
    duration: '25 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'DevOps',
    materials: [
        { name: 'Video Lectures', url: '#', type: 'video'},
        { name: 'Configuration Files', url: '#', type: 'zip' },
    ]
  },
  {
    id: 'course-5',
    title: 'Python for Data Science and ML',
    description: 'An introduction to data analysis, visualization, and machine learning with Python.',
    instructor: 'Patel Singh',
    duration: '30 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'Data Science',
    materials: [
        { name: 'Jupyter Notebooks', url: '#', type: 'zip' },
        { name: 'Dataset Collection', url: '#', type: 'zip' },
    ]
  },
  {
    id: 'course-6',
    title: 'Introduction to GenAI with Genkit',
    description: 'Learn the fundamentals of building AI-powered applications using Google\'s Genkit.',
    instructor: 'Ada Lovelace',
    duration: '10 hours',
    imageUrl: 'https://placehold.co/600x400.png',
    category: 'AI/ML',
    materials: [
        { name: 'Core Concepts PDF', url: '#', type: 'pdf' },
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
