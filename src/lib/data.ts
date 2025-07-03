'use client';

import type { Course, User, Module, Lesson, Enrollment, UpgradeRequest, PaymentAccount, SeoSettings } from '@/types';

const DB_KEY = 'course_app_data';

// --- Data Structure ---

interface Database {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  upgradeRequests: UpgradeRequest[];
  paymentSettings: PaymentAccount[];
  seoSettings: SeoSettings;
}

// --- Seed Data ---

function getInitialData(): Database {
    return {
        users: [
            { id: 'admin', name: 'Admin Utama', username: 'admin', password: 'password', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '081234567890' },
            { id: 'member', name: 'Siswa Rajin', username: 'member', password: 'password', role: 'member', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '' },
            { id: 'pro_user_1', name: 'Member Pro', username: 'pro', password: 'password', role: 'pro', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '089876543210' },
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
                  { 
                    id: 'lesson_1_1_1', 
                    title: 'Struktur Dasar Halaman HTML', 
                    type: 'text', 
                    content: '<h1>Selamat Datang di Pelajaran HTML!</h1>\n\n<p>HTML adalah singkatan dari HyperText Markup Language. Ini adalah bahasa markup standar untuk dokumen yang dirancang untuk ditampilkan di browser web.</p>\n\n<p>Setiap halaman HTML terdiri dari serangkaian <strong>elemen</strong>, yang Anda gunakan untuk melampirkan, atau membungkus, berbagai bagian konten agar terlihat atau bertindak dengan cara tertentu.</p>\n\n<h2>Elemen Dasar</h2>\n<ul>\n  <li><code>&lt;html&gt;</code>: Elemen root yang membungkus semua konten di seluruh halaman.</li>\n  <li><code>&lt;head&gt;</code>: Elemen ini bertindak sebagai wadah untuk semua hal yang ingin Anda sertakan di halaman HTML yang bukan konten yang Anda tunjukkan kepada pemirsa halaman Anda.</li>\n  <li><code>&lt;body&gt;</code>: Elemen ini berisi semua konten yang ingin Anda tampilkan kepada pengguna web saat mereka mengunjungi halaman Anda.</li>\n</ul>',
                    downloadable: true,
                  },
                  { 
                    id: 'lesson_1_1_2', 
                    title: 'Video: Elemen dan Tag Penting', 
                    type: 'video',
                    contentUrl: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
                  },
                   { 
                    id: 'lesson_1_1_3', 
                    title: 'Video YouTube: Pengenalan Framework', 
                    type: 'youtube',
                    contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  },
                ]
              },
              {
                id: 'module_1_2',
                title: 'Styling dengan CSS',
                lessons: [
                  { 
                    id: 'lesson_1_2_1', 
                    title: 'Pengenalan CSS', 
                    type: 'text',
                    content: '<h1>Pengenalan CSS</h1>\n\n<p>CSS (Cascading Style Sheets) digunakan untuk menata dan menata halaman web — misalnya, untuk mengubah font, warna, ukuran, dan jarak konten Anda, memisahkannya menjadi beberapa kolom, atau menambahkan animasi dan dekorasi lainnya.</p>',
                    downloadable: true,
                  },
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
        ],
        enrollments: [],
        upgradeRequests: [],
        paymentSettings: [
          {
            id: 'default_bca_1',
            bankName: 'Bank BCA',
            accountNumber: '1234567890',
            accountHolder: 'Admin Aplikasi Kursus',
          }
        ],
        seoSettings: {
            titleSuffix: '| Platform Kursus Online',
            metaDescription: 'Platform kursus online terbaik untuk meningkatkan skill Anda dalam berbagai bidang. Belajar dari para ahli dengan kurikulum terstruktur.',
            metaKeywords: 'kursus online, belajar online, skill development, e-learning, platform edukasi',
        },
    };
}


// --- Helper Functions ---

function saveDB(db: Database) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save data to localStorage.", e);
        throw new Error("Gagal menyimpan data ke penyimpanan lokal. Mungkin penyimpanan Anda penuh.");
    }
}

function getDB(): Database {
    if (typeof window === 'undefined') {
        return getInitialData();
    }
    const dbString = localStorage.getItem(DB_KEY);
    
    if (!dbString) {
        const initialData = getInitialData();
        saveDB(initialData);
        return initialData;
    }

    try {
        const data = JSON.parse(dbString) as Database;
        
        // Ensure data structure integrity
        if (!data.users) data.users = [];
        if (!data.courses) data.courses = [];
        if (!data.enrollments) data.enrollments = [];
        if (!data.upgradeRequests) data.upgradeRequests = [];
        if (!data.paymentSettings || !Array.isArray(data.paymentSettings)) {
          data.paymentSettings = [
            {
              id: 'default_bca_1',
              bankName: (data.paymentSettings as any)?.bankName || 'Bank BCA',
              accountNumber: (data.paymentSettings as any)?.accountNumber || '1234567890',
              accountHolder: (data.paymentSettings as any)?.accountHolder || 'Admin Aplikasi Kursus',
            }
          ];
        }
        if (!data.seoSettings) data.seoSettings = getInitialData().seoSettings;


        // --- Start of robust self-healing and security patch logic ---
        const initialDbString = JSON.stringify(data);

        const correctAdminUser = {
            id: 'admin',
            name: 'Admin Utama',
            username: 'admin',
            password: 'password',
            role: 'admin' as const,
            avatarUrl: 'https://placehold.co/100x100.png',
            whatsapp: '081234567890',
        };

        const otherUsers = data.users.filter(u => u.id !== 'admin');
        
        // Rebuild the users array to ensure the one true admin is always correct.
        data.users = [correctAdminUser, ...otherUsers];

        // Security Patch: Revert any unauthorized privilege escalation.
        // Any user who is not the designated admin cannot have the 'admin' role.
        data.users.forEach(user => {
            if (user.id !== 'admin' && user.role === 'admin') {
                user.role = 'member'; // Revert to the lowest privilege
            }
        });

        // Only write back to localStorage if a change was actually made.
        const finalDbString = JSON.stringify(data);
        if (initialDbString !== finalDbString) {
             saveDB(data);
        }
        // --- End of self-healing and security patch logic ---

        return data;
    } catch (e) {
        console.error("Failed to parse DB from localStorage, resetting.", e);
        const initialData = getInitialData();
        saveDB(initialData);
        return initialData;
    }
}

// --- User API Functions ---

export function getAllUsers(): User[] {
  const db = getDB();
  return db.users;
}

export function getUserById(id: string): User | undefined {
    const db = getDB();
    return db.users.find(user => user.id === id);
}

export type RegisterUserInput = Omit<User, 'id' | 'role' | 'avatarUrl' | 'whatsapp'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'role' | 'username'>>;

export function registerUser(data: RegisterUserInput & { avatarUrl?: string }): User {
  const db = getDB();
  if (db.users.some(u => u.username === data.username)) {
    throw new Error('Nama pengguna sudah digunakan. Silakan pilih nama pengguna lain.');
  }
  const newUser: User = {
    id: `user_${Date.now()}`,
    name: data.name,
    username: data.username,
    password: data.password, // In a real app, this should be hashed.
    role: 'member',
    avatarUrl: data.avatarUrl || 'https://placehold.co/100x100.png',
    whatsapp: '',
  };
  db.users.push(newUser);
  saveDB(db);
  return newUser;
}

export function updateUser(userId: string, data: UpdateUserInput): User {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("Pengguna tidak ditemukan.");
    }

    const currentUser = db.users[userIndex];
    const updatedUser = { ...currentUser, ...data };

    db.users[userIndex] = updatedUser;
    saveDB(db);
    return updatedUser;
}

export function validateUser(username: string, password: string): User | null {
  const db = getDB();
  const user = db.users.find(u => u.username === username);
  if (user && user.password === password) {
    return user;
  }
  return null;
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

export function updateCourse(id: string, data: Partial<Course>): Course {
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

// --- Enrollment API Functions ---

export function isUserEnrolled(userId: string, courseId: string): boolean {
  if (!userId) return false;
  const db = getDB();
  return db.enrollments.some(e => e.userId === userId && e.courseId === courseId);
}

export function enrollUserInCourse(userId: string, courseId: string): void {
  if (!userId) throw new Error("User ID is required to enroll.");
  const db = getDB();
  
  if (isUserEnrolled(userId, courseId)) {
    return;
  }
  
  if (!db.courses.some(c => c.id === courseId)) throw new Error("Course not found.");
  if (!db.users.some(u => u.id === userId)) throw new Error("User not found.");

  db.enrollments.push({ userId, courseId });
  saveDB(db);
}

export function getEnrolledCoursesForUser(userId: string): Course[] {
  if (!userId) return [];
  const db = getDB();
  const enrolledCourseIds = db.enrollments
    .filter(e => e.userId === userId)
    .map(e => e.courseId);
  
  return db.courses.filter(c => enrolledCourseIds.includes(c.id));
}


export function getCompletedCourseCount(userId: string): number {
    if (typeof window === 'undefined' || !userId) {
        return 0;
    }

    const db = getDB();
    const enrolledCourses = db.enrollments
        .filter(e => e.userId === userId)
        .map(e => db.courses.find(c => c.id === e.courseId))
        .filter((c): c is Course => !!c);
    
    let completedCount = 0;

    for (const course of enrolledCourses) {
        const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
        if (totalLessons === 0) {
            continue; // Cannot complete a course with no lessons
        }
        
        const progressString = localStorage.getItem(`progress_${userId}_${course.id}`);
        if (!progressString) {
            continue;
        }

        try {
            const completedLessons: string[] = JSON.parse(progressString);
            const completedLessonCount = new Set(completedLessons).size;

            if (completedLessonCount >= totalLessons) {
                completedCount++;
            }
        } catch (e) {
            console.error(`Error parsing progress for course ${course.id}`, e);
        }
    }

    return completedCount;
}

// --- Upgrade Request API Functions ---

export type PopulatedUpgradeRequest = UpgradeRequest & {
  userName: string;
  userAvatar: string;
};

export function createUpgradeRequest(userId: string, bankName: string, accountHolder: string): UpgradeRequest {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  // Prevent duplicate pending requests
  const existingRequest = db.upgradeRequests.find(r => r.userId === userId && r.status === 'pending');
  if (existingRequest) {
    throw new Error('Anda sudah memiliki permintaan upgrade yang sedang ditinjau.');
  }

  const newRequest: UpgradeRequest = {
    id: `req_${Date.now()}`,
    userId: user.id,
    bankName,
    accountHolder,
    requestDate: new Date().toISOString(),
    status: 'pending',
  };

  db.upgradeRequests.push(newRequest);
  saveDB(db);
  return newRequest;
}

export function getUpgradeRequests(): PopulatedUpgradeRequest[] {
    const db = getDB();
    
    const populatedRequests = db.upgradeRequests.map(req => {
        const user = db.users.find(u => u.id === req.userId);
        return {
            ...req,
            userName: user?.name || 'Pengguna Dihapus',
            userAvatar: user?.avatarUrl || 'https://placehold.co/100x100.png',
        };
    });
    
    // Return newest requests first
    return populatedRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function getUpgradeRequestByUserId(userId: string): UpgradeRequest | undefined {
    const db = getDB();
    // Find the latest request for the user
    return db.upgradeRequests
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())[0];
}

export function approveUpgrade(requestId: string): void {
    const db = getDB();
    const requestIndex = db.upgradeRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) {
        throw new Error('Permintaan tidak ditemukan.');
    }
    
    const request = db.upgradeRequests[requestIndex];
    if (request.status === 'approved') {
        throw new Error('Permintaan ini sudah disetujui.');
    }
    
    const userIndex = db.users.findIndex(u => u.id === request.userId);
    if (userIndex === -1) {
        throw new Error('Pengguna terkait dengan permintaan ini tidak ditemukan.');
    }

    // Update user role to 'pro'
    db.users[userIndex].role = 'pro';
    
    // Update request status to 'approved'
    db.upgradeRequests[requestIndex].status = 'approved';

    saveDB(db);
}

// --- Payment Settings API ---

export function getPaymentSettings(): PaymentAccount[] {
  const db = getDB();
  return db.paymentSettings;
}

export function addPaymentAccount(account: Omit<PaymentAccount, 'id'>): PaymentAccount {
  const db = getDB();
  const newAccount: PaymentAccount = {
    ...account,
    id: `pa_${Date.now()}`,
  };
  db.paymentSettings.push(newAccount);
  saveDB(db);
  return newAccount;
}

export function updatePaymentAccount(accountId: string, data: Partial<Omit<PaymentAccount, 'id'>>): PaymentAccount {
  const db = getDB();
  const accountIndex = db.paymentSettings.findIndex(acc => acc.id === accountId);
  if (accountIndex === -1) {
    throw new Error('Akun pembayaran tidak ditemukan.');
  }
  const updatedAccount = { ...db.paymentSettings[accountIndex], ...data };
  db.paymentSettings[accountIndex] = updatedAccount;
  saveDB(db);
  return updatedAccount;
}

export function deletePaymentAccount(accountId: string): void {
  const db = getDB();
  const initialLength = db.paymentSettings.length;
  db.paymentSettings = db.paymentSettings.filter(acc => acc.id !== accountId);
  if (db.paymentSettings.length === initialLength) {
    throw new Error('Gagal menghapus akun pembayaran, ID tidak ditemukan.');
  }
  saveDB(db);
}

// --- SEO Settings API ---

export function getSeoSettings(): SeoSettings {
  const db = getDB();
  return db.seoSettings;
}

export function updateSeoSettings(data: Partial<SeoSettings>): SeoSettings {
  const db = getDB();
  db.seoSettings = { ...db.seoSettings, ...data };
  saveDB(db);
  return db.seoSettings;
}
