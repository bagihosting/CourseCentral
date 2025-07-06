// ====================================================================
// PENTING: PEMBERITAHUAN TENTANG PENYIMPANAN DATA
// ====================================================================
// Aplikasi ini sedang dalam proses migrasi dari Local Storage ke MariaDB.
// Fungsi di file ini masih menggunakan Local Storage.
// Fungsi yang sudah dimigrasikan ke MariaDB berada di dalam folder /src/actions.
// ====================================================================

import type { Course, User, Module, Lesson, Enrollment, UpgradeRequest, PaymentAccount, SeoSettings, LandingPageSettings, Testimonial, ConfirmationContact, CertificateRequest, FAQItem, AiApp, GenerateAppTopologyOutput, CustomAppRequest } from '@/types';

const DB_KEY = 'course_app_data';

// --- Data Structure ---

interface Database {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  upgradeRequests: UpgradeRequest[];
  certificateRequests: CertificateRequest[];
  paymentSettings: PaymentAccount[];
  confirmationContacts: ConfirmationContact[];
  seoSettings: SeoSettings;
  landingPageSettings: LandingPageSettings;
  testimonials: Testimonial[];
  registeredDeviceIds: string[];
  customAppRequests: CustomAppRequest[];
}

// --- Seed Data ---

function getInitialData(): Database {
    const now = new Date().toISOString();
    return {
        users: [
            { id: 'admin', name: 'Admin Utama', username: 'admin', password: 'password', role: 'admin', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '6281234567890', createdAt: now, lastLoginAt: now, status: 'active', loginCount: 1, referralCode: 'ADMINREF', affiliateBalance: 0, affiliatePaid: 0 },
            { id: 'member', name: 'Siswa Rajin', username: 'member', password: 'password', role: 'member', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '', createdAt: now, lastLoginAt: now, status: 'active', loginCount: 1, referralCode: 'MEMBERREF', affiliateBalance: 0, affiliatePaid: 0 },
            { id: 'pro_user_1', name: 'Member Pro', username: 'pro', password: 'password', role: 'pro', avatarUrl: 'https://placehold.co/100x100.png', whatsapp: '6289876543210', createdAt: now, lastLoginAt: now, status: 'active', loginCount: 1, referralCode: 'PROREF', affiliateBalance: 0, affiliatePaid: 0 },
        ],
        courses: [], // Data kursus sekarang dikelola di database
        enrollments: [],
        upgradeRequests: [],
        certificateRequests: [],
        customAppRequests: [],
        paymentSettings: [
          {
            id: 'default_bca_1',
            bankName: 'Bank BCA',
            accountNumber: '1234567890',
            accountHolder: 'Admin Aplikasi Kursus',
          }
        ],
        confirmationContacts: [
          {
            id: 'cc_admin_1',
            name: 'Admin Utama',
            whatsapp: '6281234567890',
          }
        ],
        seoSettings: {
            platformName: 'Aplikasi Kursus',
            titleSuffix: '| Platform Kursus Online',
            metaDescription: 'Platform kursus online terbaik untuk meningkatkan skill Anda dalam berbagai bidang. Belajar dari para ahli dengan kurikulum terstruktur.',
            metaKeywords: 'kursus online, belajar online, skill development, e-learning, platform edukasi',
            enableAiSuggestions: true,
        },
        landingPageSettings: {
            heroHeadline: '<h1>Kursus Online Bersertifikat untuk <span class="text-primary">Meningkatkan Karir Anda</span></h1>',
            heroSubheadline: 'Temukan kursus online terbaik untuk meningkatkan skill Anda. Belajar dari nol menjadi ahli dengan materi terstruktur dari instruktur profesional dan dapatkan sertifikasi online terpercaya.',
            heroImageUrl: 'https://placehold.co/600x400.png',
            features: [
              {
                icon: 'ShieldCheck',
                title: 'Kurikulum Relevan Industri',
                description: 'Materi kursus online kami disusun secara sistematis agar sesuai dengan kebutuhan industri terkini.',
              },
              {
                icon: 'Clock',
                title: 'Akses Belajar Fleksibel',
                description: 'Dapatkan akses seumur hidup ke semua materi kursus. Belajar kapan saja sesuai kecepatan dan kenyamanan Anda.',
              },
              {
                icon: 'Users',
                title: 'Instruktur Ahli & Berpengalaman',
                description: 'Belajar langsung dari para praktisi dan ahli di bidangnya yang memiliki pengalaman nyata di industri.',
              },
            ],
            logoUrl: '',
            footerText: 'Semua Hak Cipta Dilindungi.',
            featuredTestimonialIds: ['testimonial_1', 'testimonial_2'],
            contactEmail: 'support@scriptify.com',
            contactPhone: '(021) 123-4567',
            contactAddress: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan, Indonesia 12190',
            faqs: [
              {
                id: 'faq_1',
                question: 'Apakah saya akan mendapatkan sertifikat?',
                answer: 'Tentu saja! Setelah menyelesaikan semua materi kursus, Anda akan mendapatkan sertifikat kelulusan yang dapat Anda unduh dan lampirkan di profil profesional Anda.'
              },
              {
                id: 'faq_2',
                question: 'Apakah ada batasan waktu untuk menyelesaikan kursus?',
                answer: 'Tidak ada. Dengan sekali bayar, Anda mendapatkan akses seumur hidup ke materi kursus. Anda bisa belajar kapan saja sesuai dengan kecepatan dan kenyamanan Anda.'
              },
              {
                id: 'faq_3',
                question: 'Bagaimana cara menjadi anggota Pro?',
                answer: 'Anda dapat meng-upgrade akun Anda ke Pro melalui halaman "Upgrade ke Pro" di dasbor Anda. Prosesnya melibatkan transfer manual dan konfirmasi melalui WhatsApp dengan admin kami.'
              }
            ],
            aiApps: [
              { id: 'makalah', title: 'AI Generator Makalah', description: 'Buat makalah perkuliahan lengkap dengan judul, isi, dan daftar pustaka.', icon: 'BookCopy', enabled: true },
              { id: 'blogger', title: 'AI Template Blogger', description: 'Buat template Blogger yang responsif dan dapat disesuaikan secara instan.', icon: 'Bot', enabled: true },
              { id: 'skripsi', title: 'AI Asisten Skripsi', description: 'Hasilkan draf untuk bab skripsi Anda dengan bantuan AI.', icon: 'FileText', enabled: true },
              { id: 'wordpress', title: 'Plugin Wordpress', description: 'Buat file boilerplate (readme.txt &amp; php) untuk plugin WordPress.', icon: 'Plug', enabled: true },
              { id: 'google-ads', title: 'AI Google Ads Copy', description: 'Buat teks iklan (headlines &amp; descriptions) untuk kampanye Google Ads.', icon: 'Megaphone', enabled: true },
              { id: 'digital-invitation', title: 'AI Undangan Digital', description: 'Buat teks dan konsep desain untuk undangan digital Anda.', icon: 'Mail', enabled: true },
              { id: 'umkm', title: 'AI Asisten UMKM', description: 'Buat nama, slogan, dan deskripsi singkat untuk bisnis Anda.', icon: 'Briefcase', enabled: true },
              { id: 'spss', title: 'AI Asisten SPSS', description: 'Buat sintaks SPSS dan dapatkan penjelasan untuk analisis statistik Anda.', icon: 'BarChart', enabled: true },
              { id: 'image', title: 'AI Image Generator', description: 'Buat gambar dari teks menggunakan Gemini Flash.', icon: 'ImageIcon', enabled: true },
              { id: 'prototype', title: 'AI App Prototyper', description: 'Buat rencana MVP terstruktur dari ide aplikasi mentah Anda.', icon: 'LayoutTemplate', enabled: true },
              { id: 'soap-formula', title: 'AI Formula Sabun', description: 'Hasilkan formula dasar untuk produk sabun cair dan sampo.', icon: 'FlaskConical', enabled: true },
              { id: 'genkit-app', title: 'AI Genkit App Factory', description: 'Buat boilerplate aplikasi AI portabel lengkap dengan Next.js dan Genkit.', icon: 'Server', enabled: true },
            ],
        },
        testimonials: [
          {
            id: 'testimonial_1',
            userId: 'pro_user_1',
            userName: 'Member Pro',
            userAvatar: 'https://placehold.co/100x100.png',
            userRole: 'pro',
            quote: 'Aplikasi ini benar-benar mengubah cara saya belajar. Materinya sangat relevan dengan industri saat ini dan mudah dipahami. Sangat direkomendasikan!',
            rating: 5,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'testimonial_2',
            userId: 'member',
            userName: 'Siswa Rajin',
            userAvatar: 'https://placehold.co/100x100.png',
            userRole: 'member',
            quote: 'Saya berhasil mendapatkan pekerjaan impian saya setelah menyelesaikan kursus UI/UX di sini. Kontennya sangat membatu, terutama untuk pemula seperti saya.',
            rating: 4,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        registeredDeviceIds: [],
    };
}


// --- Helper Functions ---

function saveDB(db: Database) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Gagal menyimpan data ke penyimpanan lokal.", e);
        throw new Error("Gagal menyimpan data ke penyimpanan lokal. Mungkin penyimpanan Anda penuh.");
    }
}

function getDB(): Database {
    if (typeof window === 'undefined') {
        return getInitialData();
    }
    
    const dbString = localStorage.getItem(DB_KEY);
    
    if (dbString) {
        try {
            const db = JSON.parse(dbString);
            const initialApps = getInitialData().landingPageSettings.aiApps;
            if (JSON.stringify(db.landingPageSettings.aiApps) !== JSON.stringify(initialApps)) {
                db.landingPageSettings.aiApps = initialApps;
                saveDB(db);
            }
            return db;
        } catch (e) {
            console.error("Gagal mem-parsing DB dari localStorage, mengatur ulang.", e);
        }
    }

    const initialData = getInitialData();
    saveDB(initialData);
    return initialData;
}

// --- User API Functions ---

// ===============================================
// FUNGSI DI BAWAH INI MASIH MENGGUNAKAN LOCALSTORAGE
// DAN SECARA BERTAHAP AKAN DIMIGRASIKAN
// ===============================================

export function getAllUsers(): User[] {
  const db = getDB();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let dbWasModified = false;

  db.users.forEach(user => {
      if (user.role !== 'admin' && user.status === 'active') {
          const lastLoginDate = new Date(user.lastLoginAt);
          if (lastLoginDate < thirtyDaysAgo) {
              user.status = 'inactive';
              dbWasModified = true;
          }
      }
  });

  if (dbWasModified) {
      saveDB(db);
  }
  return db.users;
}


export type RegisterUserInput = Omit<User, 'id' | 'role' | 'avatarUrl' | 'createdAt' | 'lastLoginAt' | 'status' | 'loginCount' | 'referralCode' | 'affiliateBalance' | 'affiliatePaid'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'role' | 'username' | 'createdAt'>>;

export function registerUser(data: RegisterUserInput & { avatarUrl?: string, referredBy?: string }): User {
  const db = getDB();
  if (db.users.some(u => u.username === data.username)) {
    throw new Error('Nama pengguna sudah digunakan. Silakan pilih nama pengguna lain.');
  }
  if (data.username.toLowerCase() === 'admin') {
      throw new Error("Nama pengguna 'admin' tidak diizinkan untuk pendaftaran baru.");
  }

  const DEVICE_ID_KEY = 'device_fingerprint_id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  if (db.registeredDeviceIds.includes(deviceId)) {
      throw new Error('Pendaftaran dari perangkat ini telah mencapai batas maksimum (1 akun).');
  }
  
  const now = new Date().toISOString();
  const newUser: User = {
    id: `user_${Date.now()}`,
    name: data.name,
    username: data.username,
    password: data.password,
    role: 'member',
    avatarUrl: data.avatarUrl || 'https://placehold.co/100x100.png',
    whatsapp: data.whatsapp ? data.whatsapp.replace(/[^0-9]/g, '') : '',
    createdAt: now,
    lastLoginAt: now,
    status: 'active',
    loginCount: 1,
    referralCode: `${(data.username || 'user').replace(/\s/g, '')}${Date.now().toString(36)}`,
    referredBy: data.referredBy,
    affiliateBalance: 0,
    affiliatePaid: 0,
  };
  db.users.push(newUser);
  db.registeredDeviceIds.push(deviceId);
  saveDB(db);
  return newUser;
}

export function updateUser(userId: string, data: UpdateUserInput): User {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("Pengguna tidak ditemukan.");
    }
    
    const updatedData: UpdateUserInput = { ...data };
    
    if (typeof updatedData.whatsapp === 'string') {
        updatedData.whatsapp = updatedData.whatsapp.replace(/[^0-9]/g, '');
    }

    db.users[userIndex] = { ...db.users[userIndex], ...updatedData };
    
    saveDB(db);
    return db.users[userIndex];
}

export function deleteUser(userId: string): void {
    const db = getDB();
    
    if (userId === 'admin') {
        throw new Error("Akun admin utama tidak dapat dihapus.");
    }

    const initialUserLength = db.users.length;
    db.users = db.users.filter(u => u.id !== userId);

    if (db.users.length === initialUserLength) {
        throw new Error("Gagal menghapus pengguna, ID tidak ditemukan.");
    }
    
    db.enrollments = db.enrollments.filter(e => e.userId !== userId);
    db.upgradeRequests = db.upgradeRequests.filter(r => r.userId !== userId);
    
    const testimonialToDelete = db.testimonials.find(t => t.userId === userId);
    if (testimonialToDelete) {
      db.testimonials = db.testimonials.filter(t => t.id !== testimonialToDelete.id);
      db.landingPageSettings.featuredTestimonialIds = db.landingPageSettings.featuredTestimonialIds.filter(id => id !== testimonialToDelete.id);
    }
    
    saveDB(db);
}

export function reactivateUser(userId: string): User {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("Pengguna tidak ditemukan.");
    }
    db.users[userIndex].status = 'active';
    saveDB(db);
    return db.users[userIndex];
}

// --- Course and Curriculum functions are now migrated to /src/actions/ ---

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
  
  // NOTE: This check will fail as courses are no longer in localStorage.
  // This function needs to be migrated to a database action.
  // if (!db.courses.some(c => c.id === courseId)) throw new Error("Course not found.");
  if (!db.users.some(u => u.id === userId)) throw new Error("User not found.");

  db.enrollments.push({ userId, courseId });
  saveDB(db);
}

export function getEnrolledCoursesForUser(userId: string): Course[] {
    // This function is deprecated and will not work correctly until migrated.
    // It will return an empty array as db.courses is empty.
    if (!userId) return [];
    const db = getDB();
    const enrolledCourseIds = db.enrollments
        .filter(e => e.userId === userId)
        .map(e => e.courseId);
    
    // This part is now incorrect as courses are in the DB.
    return db.courses.filter(c => enrolledCourseIds.includes(c.id));
}


export function getCompletedCourseCount(userId: string): number {
    // This function is deprecated and will not work correctly until migrated.
    if (typeof window === 'undefined' || !userId) {
        return 0;
    }
    return 0; // Returning 0 as progress tracking is not yet migrated.
}

// --- Upgrade Request API Functions ---

export type PopulatedUpgradeRequest = UpgradeRequest & {
  userName: string;
  userAvatar: string;
  userWhatsapp?: string;
};

export function createUpgradeRequest(userId: string, bankName: string, accountHolder: string): UpgradeRequest {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
  }

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
            userWhatsapp: user?.whatsapp,
        };
    });
    
    return populatedRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function getUpgradeRequestByUserId(userId: string): UpgradeRequest | undefined {
    const db = getDB();
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

    const upgradedUser = db.users[userIndex];
    
    upgradedUser.role = 'pro';
    db.upgradeRequests[requestIndex].status = 'approved';

    if (upgradedUser.referredBy) {
        const referrerIndex = db.users.findIndex(u => u.referralCode === upgradedUser.referredBy);
        if (referrerIndex !== -1) {
            const referrer = db.users[referrerIndex];
            const successfulReferrals = db.users.filter(u => u.referredBy === referrer.referralCode && u.role === 'pro').length;
            const successfulReferralsCount = successfulReferrals;

            if (referrer.role === 'member') {
                if (successfulReferralsCount === 5) {
                    referrer.role = 'pro';
                } else if (successfulReferralsCount > 5) {
                    referrer.affiliateBalance = (referrer.affiliateBalance || 0) + 10000;
                }
            } else if (referrer.role === 'pro' || referrer.role === 'admin') {
                referrer.affiliateBalance = (referrer.affiliateBalance || 0) + 10000;
            }
        }
    }

    saveDB(db);
}

export function cancelUpgradeRequest(userId: string): void {
  const db = getDB();
  const request = db.upgradeRequests.find(r => r.userId === userId && r.status === 'pending');
  if (!request) {
    throw new Error('Permintaan upgrade yang sedang menunggu tidak ditemukan untuk dibatalkan.');
  }
  
  const initialLength = db.upgradeRequests.length;
  db.upgradeRequests = db.upgradeRequests.filter(r => r.id !== request.id);

  if(db.upgradeRequests.length === initialLength) {
    throw new Error("Gagal membatalkan permintaan.");
  }

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

// --- Confirmation Contacts API ---

export function getConfirmationContacts(): ConfirmationContact[] {
  const db = getDB();
  return db.confirmationContacts;
}

export function addConfirmationContact(contact: Omit<ConfirmationContact, 'id'>): ConfirmationContact {
  const db = getDB();
  const newContact: ConfirmationContact = {
    ...contact,
    whatsapp: contact.whatsapp.replace(/[^0-9]/g, ''),
    id: `cc_${Date.now()}`,
  };
  db.confirmationContacts.push(newContact);
  saveDB(db);
  return newContact;
}

export function updateConfirmationContact(contactId: string, data: Partial<Omit<ConfirmationContact, 'id'>>): ConfirmationContact {
  const db = getDB();
  const contactIndex = db.confirmationContacts.findIndex(c => c.id === contactId);
  if (contactIndex === -1) {
    throw new Error('Kontak tidak ditemukan.');
  }
  
  const updatedData: Partial<Omit<ConfirmationContact, 'id'>> = { ...data };
  if (typeof updatedData.whatsapp === 'string') {
      updatedData.whatsapp = updatedData.whatsapp.replace(/[^0-9]/g, '');
  }

  db.confirmationContacts[contactIndex] = { ...db.confirmationContacts[contactIndex], ...updatedData };
  
  saveDB(db);
  return db.confirmationContacts[contactIndex];
}

export function deleteConfirmationContact(contactId: string): void {
  const db = getDB();
  const initialLength = db.confirmationContacts.length;
  db.confirmationContacts = db.confirmationContacts.filter(c => c.id !== contactId);
  if (db.confirmationContacts.length === initialLength) {
    throw new Error('Gagal menghapus kontak, ID tidak ditemukan.');
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

// --- Landing Page Settings API ---

export function getLandingPageSettings(): LandingPageSettings {
  const db = getDB();
  return db.landingPageSettings;
}

export function updateLandingPageSettings(data: Partial<LandingPageSettings>): LandingPageSettings {
  const db = getDB();
  db.landingPageSettings = { ...db.landingPageSettings, ...data };
  saveDB(db);
  return db.landingPageSettings;
}

// --- Testimonial API ---
export function getAllTestimonials(): Testimonial[] {
    const db = getDB();
    return db.testimonials.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTestimonialByUserId(userId: string): Testimonial | undefined {
    const db = getDB();
    return db.testimonials.find(t => t.userId === userId);
}

export function addOrUpdateTestimonial(testimonialData: {userId: string; quote: string; rating: number}): Testimonial {
    const db = getDB();
    const user = db.users.find(u => u.id === testimonialData.userId);
    if (!user) {
        throw new Error("Pengguna tidak ditemukan.");
    }
    
    const existingTestimonialIndex = db.testimonials.findIndex(t => t.userId === testimonialData.userId);

    if (existingTestimonialIndex !== -1) {
        // Update existing testimonial
        const existing = db.testimonials[existingTestimonialIndex];
        existing.quote = testimonialData.quote;
        existing.rating = testimonialData.rating;
        saveDB(db);
        return existing;
    } else {
        // Add new testimonial
        const newTestimonial: Testimonial = {
            id: `testimonial_${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatarUrl,
            userRole: user.role === 'pro' ? 'pro' : 'member',
            quote: testimonialData.quote,
            rating: testimonialData.rating,
            createdAt: new Date().toISOString()
        };
        db.testimonials.push(newTestimonial);
        saveDB(db);
        return newTestimonial;
    }
}

export function deleteTestimonial(testimonialId: string): void {
    const db = getDB();
    const initialLength = db.testimonials.length;
    
    db.testimonials = db.testimonials.filter(t => t.id !== testimonialId);
    
    if (db.testimonials.length === initialLength) {
        throw new Error("Gagal menghapus testimoni, ID tidak ditemukan.");
    }

    // Also remove from featured list if present
    db.landingPageSettings.featuredTestimonialIds = db.landingPageSettings.featuredTestimonialIds.filter(id => id !== testimonialId);

    saveDB(db);
}


// --- Certificate Request API ---
export function hasUserRequestedCertificate(userId: string, courseId: string): boolean {
  const db = getDB();
  return db.certificateRequests.some(req => req.userId === userId && req.courseId === courseId);
}

export function createCertificateRequest(userId: string, courseId: string): CertificateRequest {
  const db = getDB();
  if (hasUserRequestedCertificate(userId, courseId)) {
    throw new Error('Anda sudah mengajukan sertifikat untuk kursus ini.');
  }

  const newRequest: CertificateRequest = {
    id: `cert_req_${Date.now()}`,
    userId,
    courseId,
    requestDate: new Date().toISOString(),
    status: 'pending',
  };

  db.certificateRequests.push(newRequest);
  saveDB(db);
  return newRequest;
}

export type PopulatedCertificateRequest = CertificateRequest & {
  userName: string;
  userAvatar: string;
  courseTitle: string;
};

export function getCertificateRequests(): PopulatedCertificateRequest[] {
  const db = getDB();
  return db.certificateRequests
    .map(req => {
      const user = db.users.find(u => u.id === req.userId);
      // This will fail since courses are no longer in localStorage
      const course = db.courses.find(c => c.id === req.courseId);
      return {
        ...req,
        userName: user?.name || 'N/A',
        userAvatar: user?.avatarUrl || '',
        courseTitle: course?.title || 'Kursus Dihapus',
      };
    })
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function approveCertificateRequest(requestId: string, certificateHtml: string): void {
  const db = getDB();
  const request = db.certificateRequests.find(req => req.id === requestId);
  if (!request) {
    throw new Error('Permintaan sertifikat tidak ditemukan.');
  }
  request.status = 'approved';
  request.certificateHtml = certificateHtml;
  request.approvedAt = new Date().toISOString();
  saveDB(db);
}

export function getApprovedCertificatesForUser(userId: string): PopulatedCertificateRequest[] {
    const db = getDB();
    return db.certificateRequests
        .filter(req => req.userId === userId && req.status === 'approved')
        .map(req => {
            const user = db.users.find(u => u.id === req.userId);
            // This will fail
            const course = db.courses.find(c => c.id === req.courseId);
            return {
                ...req,
                userName: user?.name || 'N/A',
                userAvatar: user?.avatarUrl || '',
                courseTitle: course?.title || 'Kursus Dihapus',
            };
        })
        .sort((a, b) => new Date(b.approvedAt!).getTime() - new Date(a.approvedAt!).getTime());
}

export function awardCertificateToUser(userId: string, courseId: string, certificateHtml: string): CertificateRequest {
    const db = getDB();
    const existingRequest = db.certificateRequests.find(r => r.userId === userId && r.courseId === courseId);

    if (existingRequest) {
        existingRequest.status = 'approved';
        existingRequest.certificateHtml = certificateHtml;
        existingRequest.approvedAt = new Date().toISOString();
        saveDB(db);
        return existingRequest;
    }

    const newRequest: CertificateRequest = {
        id: `cert_req_${Date.now()}`,
        userId,
        courseId,
        requestDate: new Date().toISOString(),
        status: 'approved',
        certificateHtml,
        approvedAt: new Date().toISOString(),
    };

    db.certificateRequests.push(newRequest);
    saveDB(db);
    return newRequest;
}

// --- Affiliate API Functions ---
export type PopulatedReferredUser = Pick<User, 'id' | 'name' | 'role' | 'createdAt'>;

export function getReferredUsers(userId: string): PopulatedReferredUser[] {
    const db = getDB();
    const referrer = db.users.find(u => u.id === userId);
    if (!referrer) return [];
    
    return db.users
        .filter(u => u.referredBy === referrer.referralCode)
        .map(u => ({ id: u.id, name: u.name, role: u.role, createdAt: u.createdAt }));
}

export type PopulatedAffiliateStat = {
    userId: string;
    userName: string;
    userAvatar: string;
    userRole: User['role'];
    successfulReferrals: number;
    unpaidBalance: number;
    paidBalance: number;
}

export function getAffiliateStats(): PopulatedAffiliateStat[] {
    const db = getDB();
    return db.users
        .map(user => {
            const successfulReferrals = db.users.filter(u => u.referredBy === user.referralCode && u.role === 'pro').length;
            return {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatarUrl,
                userRole: user.role,
                successfulReferrals: successfulReferrals,
                unpaidBalance: user.affiliateBalance,
                paidBalance: user.affiliatePaid,
            };
        })
        .filter(stat => stat.successfulReferrals > 0 || stat.unpaidBalance > 0 || stat.paidBalance > 0)
        .sort((a, b) => b.unpaidBalance - a.unpaidBalance);
}

export function processPayout(userId: string): void {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        throw new Error('Pengguna tidak ditemukan.');
    }

    if (user.affiliateBalance <= 0) {
        throw new Error('Tidak ada saldo untuk dibayarkan.');
    }

    user.affiliatePaid += user.affiliateBalance;
    user.affiliateBalance = 0;
    saveDB(db);
}

// --- Custom App Request API Functions ---
export type PopulatedCustomAppRequest = CustomAppRequest & {
  userName: string;
  userAvatar: string;
};

export function getCustomAppRequests(): PopulatedCustomAppRequest[] {
    const db = getDB();
    return db.customAppRequests
        .map(req => {
            const user = db.users.find(u => u.id === req.userId);
            return {
                ...req,
                userName: user?.name || 'N/A',
                userAvatar: user?.avatarUrl || '',
            };
        })
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function getCustomAppRequestsForUser(userId: string): CustomAppRequest[] {
    const db = getDB();
    return db.customAppRequests
        .filter(req => req.userId === userId)
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function createCustomAppRequest(
  userId: string, 
  appName: string, 
  appKeywords: string, 
  topology: GenerateAppTopologyOutput, 
  paymentDetails: { bankName: string, accountHolder: string }
): CustomAppRequest {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) throw new Error('Pengguna tidak ditemukan.');
  if (user.role !== 'pro' && user.role !== 'admin') throw new Error('Hanya member Pro yang dapat mengajukan permintaan ini.');

  const newRequest: CustomAppRequest = {
    id: `custom_app_${Date.now()}`,
    userId,
    appName,
    appKeywords,
    topology,
    paymentDetails,
    requestDate: new Date().toISOString(),
    status: 'pending_approval',
  };

  db.customAppRequests.push(newRequest);
  saveDB(db);
  return newRequest;
}

export function approveCustomAppRequest(requestId: string): void {
    const db = getDB();
    const request = db.customAppRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Permintaan tidak ditemukan.');
    if (request.status !== 'pending_approval') throw new Error('Permintaan ini tidak dalam status menunggu persetujuan.');

    request.status = 'in_progress';
    saveDB(db);
}

export function completeCustomAppRequest(requestId: string, resultLink: string, adminNotes?: string): void {
    const db = getDB();
    const request = db.customAppRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Permintaan tidak ditemukan.');
    if (request.status !== 'in_progress') throw new Error('Hanya permintaan yang sedang dikerjakan yang dapat diselesaikan.');
    
    request.status = 'completed';
    request.resultLink = resultLink;
    request.adminNotes = adminNotes;
    saveDB(db);
}
