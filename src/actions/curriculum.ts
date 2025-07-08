
'use server';

import { getCourseById, updateCourse } from './courses';
import type { Lesson, Module } from '@/types';
import DOMPurify from 'isomorphic-dompurify';
import { pool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { getAuthUser } from './utils';

const INSTRUCTOR_DAILY_LESSON_LIMIT = 10;

export async function addModule(courseId: string): Promise<void> {
    const actor = await getAuthUser();
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    if (course.authorId !== actor.id && actor.role !== 'admin') throw new Error("Anda tidak berhak mengubah kursus ini.");

    const newModule: Module = {
        id: `module_${Date.now()}`,
        title: "Modul Baru",
        lessons: []
    };
    course.modules.push(newModule);
    await updateCourse(courseId, { modules: course.modules });
}

export async function updateModule(courseId: string, moduleId: string, data: { title: string }): Promise<void> {
    const actor = await getAuthUser();
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
     if (course.authorId !== actor.id && actor.role !== 'admin') throw new Error("Anda tidak berhak mengubah kursus ini.");

    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if(moduleIndex === -1) throw new Error("Modul tidak ditemukan.");

    course.modules[moduleIndex].title = data.title;
    course.modules.sort((a, b) => a.title.localeCompare(b.title));
    await updateCourse(courseId, { modules: course.modules });
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    const actor = await getAuthUser();
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    if (course.authorId !== actor.id && actor.role !== 'admin') throw new Error("Anda tidak berhak mengubah kursus ini.");

    const initialLength = course.modules.length;
    course.modules = course.modules.filter(m => m.id !== moduleId);
    if (course.modules.length === initialLength) throw new Error("Modul tidak ditemukan untuk dihapus.");

    await updateCourse(courseId, { modules: course.modules });
}

export async function addLesson(courseId: string, moduleId: string, data: Omit<Lesson, 'id' | 'downloadable'>): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const author = await getAuthUser(connection);
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT role, lessons_created_today, last_lesson_created_at FROM users WHERE id = ? FOR UPDATE', [author.id]);
        if (userRows.length === 0) throw new Error("Pengajar tidak ditemukan.");
        const user = userRows[0];

        const [courseRows] = await connection.query<RowDataPacket[]>("SELECT * FROM courses WHERE id = ? FOR UPDATE", [courseId]);
        if(courseRows.length === 0) throw new Error("Kursus tidak ditemukan.");
        const course = JSON.parse(JSON.stringify(courseRows[0]));
        course.modules = JSON.parse(course.modules || '[]');


        if (course.authorId !== author.id && author.role !== 'admin') throw new Error("Anda tidak berhak menambah pelajaran ke kursus ini.");

        if (user.role !== 'admin' && user.role !== 'instructor') {
            throw new Error("Hanya pengajar atau admin yang bisa menambah pelajaran.");
        }

        if (user.role === 'instructor') {
            const today = new Date().toISOString().split('T')[0];
            const lastCreationDate = user.last_lesson_created_at ? new Date(user.last_lesson_created_at).toISOString().split('T')[0] : null;
            
            let lessonsToday = user.lessons_created_today;
            if (lastCreationDate !== today) {
                lessonsToday = 0;
            }
            
            if (lessonsToday >= INSTRUCTOR_DAILY_LESSON_LIMIT) {
                throw new Error(`Anda telah mencapai batas harian ${INSTRUCTOR_DAILY_LESSON_LIMIT} pelajaran per hari.`);
            }
        }

        if (data.type === 'text' && data.content) {
            data.content = DOMPurify.sanitize(data.content);
        }

        const module = course.modules.find((m: Module) => m.id === moduleId);
        if (!module) throw new Error("Modul tidak ditemukan.");

        const newLesson: Lesson = { ...data, id: `lesson_${Date.now()}`, downloadable: data.type === 'zip' || data.type === 'text' };
        module.lessons.push(newLesson);
        module.lessons.sort((a: Lesson, b: Lesson) => a.title.localeCompare(b.title));

        await connection.query(
            "UPDATE courses SET modules = ? WHERE id = ?",
            [JSON.stringify(course.modules), courseId]
        );

        if (user.role === 'instructor') {
            await connection.query(
                "UPDATE users SET lessons_created_today = IF(DATE(last_lesson_created_at) = CURDATE(), lessons_created_today + 1, 1), last_lesson_created_at = NOW() WHERE id = ?",
                [author.id]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error("Failed to add lesson:", error);
        throw error;
    } finally {
        connection.release();
    }
}


export async function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Omit<Lesson, 'id' | 'downloadable'>): Promise<void> {
    const actor = await getAuthUser();
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    if (course.authorId !== actor.id && actor.role !== 'admin') throw new Error("Anda tidak berhak mengubah kursus ini.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if(lessonIndex === -1) throw new Error("Pelajaran tidak ditemukan.");
    
    if (data.type === 'text' && data.content) {
        data.content = DOMPurify.sanitize(data.content);
    }

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
    const actor = await getAuthUser();
    const course = await getCourseById(courseId);
    if (!course) throw new Error("Kursus tidak ditemukan.");
    if (course.authorId !== actor.id && actor.role !== 'admin') throw new Error("Anda tidak berhak mengubah kursus ini.");

    const module = course.modules.find(m => m.id === moduleId);
    if(!module) throw new Error("Modul tidak ditemukan.");

    const initialLength = module.lessons.length;
    module.lessons = module.lessons.filter(l => l.id !== lessonId);
    if (module.lessons.length === initialLength) throw new Error("Pelajaran tidak ditemukan untuk dihapus.");
    
    await updateCourse(courseId, { modules: course.modules });
}
