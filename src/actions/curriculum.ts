'use server';

import { getCourseById, updateCourse } from './courses';
import type { Lesson, Module } from '@/types';

export async function addModule(courseId: string, data: { title: string }): Promise<void> {
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    
    const newModule: Module = {
        id: `module_${Date.now()}`,
        title: data.title,
        lessons: []
    };
    course.modules.push(newModule);
    course.modules.sort((a, b) => a.title.localeCompare(b.title));
    await updateCourse(courseId, { modules: course.modules });
}

export async function updateModule(courseId: string, moduleId: string, data: { title: string }): Promise<void> {
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if(moduleIndex === -1) throw new Error("Modul tidak ditemukan.");

    course.modules[moduleIndex].title = data.title;
    course.modules.sort((a, b) => a.title.localeCompare(b.title));
    await updateCourse(courseId, { modules: course.modules });
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const initialLength = course.modules.length;
    course.modules = course.modules.filter(m => m.id !== moduleId);
    if (course.modules.length === initialLength) throw new Error("Modul tidak ditemukan untuk dihapus.");

    await updateCourse(courseId, { modules: course.modules });
}

export async function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id'>): Promise<void> {
    const course = await getCourseById(courseId);
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
    await updateCourse(courseId, { modules: course.modules });
}

export async function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id'>): Promise<void> {
    const course = await getCourseById(courseId);
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
    await updateCourse(courseId, { modules: course.modules });
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const initialLength = module.lessons.length;
    module.lessons = module.lessons.filter(l => l.id !== lessonId);
    if (module.lessons.length === initialLength) throw new Error("Pelajaran tidak ditemukan untuk dihapus.");
    
    await updateCourse(courseId, { modules: course.modules });
}
