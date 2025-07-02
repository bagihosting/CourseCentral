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
        courses: []
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
