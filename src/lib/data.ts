import type { Course, User, Module, Lesson } from '@/types';

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
      { id: 'm1', title: 'Pendahuluan React', lessons: [{ id: 'l1', title: 'Setup Lingkungan', type: 'text', downloadable: true }, { id: 'l2', title: 'Dasar-dasar JSX', type: 'video', contentUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk' }] },
      { id: 'm2', title: 'Manajemen State', lessons: [{ id: 'l3', title: 'useState & useEffect', type: 'video', contentUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk' }] },
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
      { id: 'm1', title: 'Pengenalan', lessons: [{ id: 'l1', title: 'Instalasi Python & Jupyter', type: 'zip', downloadable: true, contentUrl: 'https://example.com/file.zip' }] },
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
  const course = courses.find(c => c.id === id);
  // Return a deep copy to prevent mutation issues in server components
  return course ? JSON.parse(JSON.stringify(course)) : undefined;
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

// --- Curriculum API Functions ---

export async function addModule(courseId: string, data: { title: string }): Promise<Module> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan");
    const newModule: Module = { id: `m${Date.now()}`, title: data.title, lessons: [] };
    course.modules.push(newModule);
    return newModule;
}

export async function updateModule(courseId: string, moduleId: string, data: { title: string }): Promise<Module> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!module) throw new Error("Modul tidak ditemukan");
    module.title = data.title;
    return module;
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.modules = course.modules.filter(m => m.id !== moduleId);
    }
}

export async function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!module) throw new Error("Modul tidak ditemukan");
    const newLesson: Lesson = { ...data, id: `l${Date.now()}` };
    if (data.type === 'zip' || data.type === 'text') newLesson.downloadable = true;
    module.lessons.push(newLesson);
    return newLesson;
}

export async function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id'>): Promise<Lesson> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    const lessonIndex = module?.lessons.findIndex(l => l.id === lessonId);
    if (module && lessonIndex !== undefined && lessonIndex !== -1) {
        const updatedLesson = { ...module.lessons[lessonIndex], ...data };
        if (data.type === 'zip' || data.type === 'text') updatedLesson.downloadable = true;
        else updatedLesson.downloadable = false;
        module.lessons[lessonIndex] = updatedLesson;
        return updatedLesson;
    }
    throw new Error("Pelajaran tidak ditemukan");
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    await delay(300);
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (module) {
        module.lessons = module.lessons.filter(l => l.id !== lessonId);
    }
}
