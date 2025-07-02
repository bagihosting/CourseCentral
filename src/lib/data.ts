'use client';

import type { Course, User, Module, Lesson } from '@/types';

const DB_KEY = 'course_app_data';

// --- Data Structure ---

interface Database {
  users: User[];
  courses: Course[];
}

// --- Seed Data ---

function getInitialData(): Database {
    return {
        users: [
            { id: 'admin', name: 'Admin Utama', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png' },
            { id: 'member', name: 'Siswa Rajin', role: 'member', avatarUrl: 'https://placehold.co/100x100.png' },
        ],
        courses: [
          {
            id: 'course_1',
            title: 'Dasar-Dasar Pengembangan Web Modern',
            description: 'Pelajari dasar-dasar HTML, CSS, dan JavaScript untuk membangun website interaktif pertama Anda. Kursus ini dirancang untuk pemula absolut tanpa pengalaman pemrograman sebelumnya.',
            instructor: 'Andi Bachtiar',
            price: 0,
            imageUrl: 'https://placehold.co/600x400.png',
            modules: [
              {
                id: 'module_1_1',
                title: 'Pengenalan HTML',
                lessons: [
                  { id: 'lesson_1_1_1', title: 'Struktur Dasar Halaman HTML', type: 'text' },
                  { id: 'lesson_1_1_2', title: 'Video: Elemen dan Tag Penting', type: 'video' },
                ]
              },
              {
                id: 'module_1_2',
                title: 'Styling dengan CSS',
                lessons: [
                  { id: 'lesson_1_2_1', title: 'Pengenalan CSS', type: 'text' },
                ]
              }
            ]
          },
          {
            id: 'course_2',
            title: 'React: Dari Pemula Hingga Mahir',
            description: 'Kuasai framework JavaScript paling populer, React. Bangun aplikasi web yang cepat, dinamis, dan dapat diskalakan dari awal.',
            instructor: 'Citra Dewi',
            price: 250000,
            imageUrl: 'https://placehold.co/600x400.png',
            modules: []
          },
          {
            id: 'course_3',
            title: 'Manajemen Proyek dengan Agile dan Scrum',
            description: 'Pelajari cara mengelola proyek kompleks secara efisien menggunakan metodologi Agile dan framework Scrum. Tingkatkan produktivitas tim Anda.',
            instructor: 'Budi Santoso',
            price: 150000,
            imageUrl: 'https://placehold.co/600x400.png',
            modules: []
          },
           {
            id: 'course_4',
            title: 'Desain UI/UX untuk Aplikasi Mobile',
            description: 'Ciptakan antarmuka yang indah dan pengalaman pengguna yang menyenangkan. Pelajari prinsip-prinsip desain, wireframing, dan prototyping.',
            instructor: 'Rina Kartika',
            price: 200000,
            imageUrl: 'https://placehold.co/600x400.png',
            modules: []
          },
        ]
    };
}


// --- Helper Functions ---

function getDB(): Database {
    if (typeof window === 'undefined') {
        return getInitialData();
    }
    const dbString = localStorage.getItem(DB_KEY);
    if (!dbString) {
        const initialData = getInitialData();
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        return initialData;
    }
    try {
        return JSON.parse(dbString) as Database;
    } catch (e) {
        console.error("Failed to parse DB from localStorage, resetting.", e);
        const initialData = getInitialData();
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        return initialData;
    }
}

function saveDB(db: Database) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- User API Functions ---

export function getAllUsers(): User[] {
  const db = getDB();
  return db.users;
}

// --- Course API Functions ---

export function getAllCourses(): Course[] {
  const db = getDB();
  return db.courses;
}

export function getCourseById(id: string): Course | undefined {
  const db = getDB();
  return db.courses.find(course => course.id === id);
}

export function createCourse(data: Omit<Course, 'id'>): Course {
  const db = getDB();
  const newCourse: Course = {
    ...data,
    id: `course_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    modules: [],
  };
  db.courses.push(newCourse);
  saveDB(db);
  return newCourse;
}

export function updateCourse(id: string, data: Omit<Course, 'id' | 'modules'>): Course {
    const db = getDB();
    const courseIndex = db.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
        throw new Error("Kursus tidak ditemukan.");
    }
    const updatedCourse = { ...db.courses[courseIndex], ...data };
    db.courses[courseIndex] = updatedCourse;
    saveDB(db);
    return updatedCourse;
}

export function deleteCourse(id: string): void {
    const db = getDB();
    const initialLength = db.courses.length;
    db.courses = db.courses.filter(c => c.id !== id);
    if(db.courses.length === initialLength) {
        throw new Error("Gagal menghapus kursus, ID tidak ditemukan.");
    }
    saveDB(db);
}

// --- Curriculum API Functions ---

export function addModule(courseId: string, data: { title: string }): Module {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    
    const newModule: Module = {
        id: `module_${Date.now()}`,
        title: data.title,
        lessons: []
    };
    course.modules.push(newModule);
    course.modules.sort((a, b) => a.title.localeCompare(b.title));
    saveDB(db);
    return newModule;
}

export function updateModule(courseId: string, moduleId: string, data: { title: string }): Module {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    
    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    module.title = data.title;
    course.modules.sort((a, b) => a.title.localeCompare(b.title));
    saveDB(db);
    return module;
}

export function deleteModule(courseId: string, moduleId: string): void {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const initialLength = course.modules.length;
    course.modules = course.modules.filter(m => m.id !== moduleId);
    if (course.modules.length === initialLength) throw new Error("Modul tidak ditemukan.");

    saveDB(db);
}

export function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id'>): Lesson {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const newLesson: Lesson = {
        ...data,
        id: `lesson_${Date.now()}`,
        downloadable: data.type === 'zip' || data.type === 'text',
    };
    module.lessons.push(newLesson);
    module.lessons.sort((a, b) => a.title.localeCompare(b.title));
    saveDB(db);
    return newLesson;
}

export function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id'>): Lesson {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if(lessonIndex === -1) throw new Error("Pelajaran tidak ditemukan.");

    const updatedLesson = {
        ...module.lessons[lessonIndex],
        ...data,
        downloadable: data.type === 'zip' || data.type === 'text',
    }
    module.lessons[lessonIndex] = updatedLesson;
    module.lessons.sort((a, b) => a.title.localeCompare(b.title));
    saveDB(db);
    return updatedLesson;
}

export function deleteLesson(courseId: string, moduleId: string, lessonId: string): void {
    const db = getDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const initialLength = module.lessons.length;
    module.lessons = module.lessons.filter(l => l.id !== lessonId);
    if (module.lessons.length === initialLength) throw new Error("Pelajaran tidak ditemukan.");
    
    saveDB(db);
}
