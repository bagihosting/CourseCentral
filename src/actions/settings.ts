
'use server';

import { pool } from '@/lib/db';
import type { SeoSettings, LandingPageSettings, PaymentAccount, ConfirmationContact, Testimonial, User } from '@/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import DOMPurify from 'isomorphic-dompurify';

// --- Default Settings ---
const DEFAULT_SEO_SETTINGS: SeoSettings = {
    platformName: 'CourseCentral',
    titleSuffix: '| Belajar Apapun, Kapanpun',
    metaDescription: 'Platform kursus online terlengkap dengan sertifikasi untuk meningkatkan karir Anda. Mulai belajar dari para ahli di bidangnya hari ini!',
    metaKeywords: 'kursus online, belajar online, sertifikasi, e-learning, platform edukasi',
    enableAiSuggestions: true,
};

const DEFAULT_LANDING_PAGE_SETTINGS: LandingPageSettings = {
    heroHeadline: 'Tingkatkan <span class="text-primary">Skill & Karir</span> Anda ke Level Berikutnya',
    heroSubheadline: 'Platform kursus online bersertifikat untuk membantu Anda menguasai keahlian baru, dari pemrograman hingga desain, langsung dari para ahli di industrinya.',
    heroImageUrl: 'https://placehold.co/1280x720.png',
    features: [
        { icon: 'ShieldCheck', title: 'Sertifikasi Terpercaya', description: 'Dapatkan sertifikat yang diakui untuk memvalidasi keahlian dan meningkatkan nilai Anda di pasar kerja.' },
        { icon: 'Clock', title: 'Belajar Fleksibel', description: 'Akses materi kapan saja dan di mana saja. Sesuaikan jadwal belajar dengan kesibukan Anda.' },
        { icon: 'Users', title: 'Komunitas & Mentor', description: 'Bergabunglah dengan komunitas pembelajar aktif dan dapatkan bimbingan dari para instruktur ahli.' },
    ],
    logoUrl: '',
    footerText: 'Hak Cipta Dilindungi.',
    featuredTestimonialIds: [],
    contactEmail: 'support@example.com',
    contactPhone: '0812-3456-7890',
    contactAddress: 'Jl. Jenderal Sudirman No.Kav. 52-53, Senayan, Kebayoran Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12190',
    faqs: [
        { id: 'faq_1', question: 'Apakah saya akan mendapatkan sertifikat?', answer: 'Ya, semua kursus kami menyediakan sertifikat penyelesaian yang dapat Anda unduh setelah menyelesaikan semua materi.' },
        { id: 'faq_2', question: 'Bagaimana cara menjadi anggota Pro?', answer: 'Anda dapat meng-upgrade keanggotaan Anda melalui halaman "Upgrade ke Pro" di dasbor Anda setelah masuk.' },
    ],
    aiApps: [
        { id: 'blogger', title: 'AI Template Blogger', description: 'Buat template Blogger XML yang responsif dan modern.', icon: 'Bot', enabled: true },
        { id: 'skripsi', title: 'AI Asisten Skripsi', description: 'Buat draf untuk bab-bab skripsi Anda secara instan.', icon: 'FileText', enabled: true },
        { id: 'wordpress', title: 'AI Generator Plugin WP', description: 'Buat file boilerplate untuk plugin WordPress baru.', icon: 'Plug', enabled: true },
        { id: 'google-ads', title: 'AI Generator Iklan Google', description: 'Buat teks iklan yang menarik untuk kampanye Google Ads.', icon: 'Megaphone', enabled: true },
        { id: 'digital-invitation', title: 'AI Generator Undangan Digital', description: 'Rangkai kata-kata indah untuk undangan digital Anda.', icon: 'Mail', enabled: true },
        { id: 'umkm', title: 'AI Asisten Profil UMKM', description: 'Buat nama, slogan, dan deskripsi untuk bisnis baru Anda.', icon: 'Briefcase', enabled: true },
        { id: 'spss', title: 'AI Asisten SPSS', description: 'Ubah deskripsi analisis menjadi sintaks SPSS yang valid.', icon: 'BarChart', enabled: true },
        { id: 'image', title: 'AI Image Generator', description: 'Ubah teks menjadi gambar yang menakjubkan.', icon: 'ImageIcon', enabled: true },
        { id: 'prototype', title: 'AI App Prototyper', description: 'Ubah ide aplikasi mentah menjadi rencana MVP.', icon: 'LayoutTemplate', enabled: true },
        { id: 'soap-formula', title: 'AI Generator Formula Sabun', description: 'Hasilkan formula dasar untuk produk pembersih.', icon: 'FlaskConical', enabled: true },
        { id: 'makalah', title: 'AI Generator Makalah', description: 'Buat draf makalah kuliah lengkap dengan berbagai jurusan.', icon: 'BookCopy', enabled: true },
        { id: 'genkit-app', title: 'AI Genkit App Factory', description: 'Buat boilerplate aplikasi AI portabel dengan Next.js & Genkit.', icon: 'Server', enabled: true },
    ]
};

// --- Generic Settings Functions ---
async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT value FROM settings WHERE `key` = ?', [key]);
        if (rows.length > 0) {
            return { ...defaultValue, ...JSON.parse(rows[0].value) };
        }
        // If not found, insert default and return it
        await pool.query('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [key, JSON.stringify(defaultValue)]);
        return defaultValue;
    } catch (error) {
        console.error(`🔴 Gagal mengambil atau menyimpan pengaturan untuk kunci '${key}':`, error);
        return defaultValue;
    }
}

async function updateSetting<T>(key: string, data: Partial<T>): Promise<void> {
    // SECURITY: Sanitize user-provided HTML content before saving
    const sanitizedData = { ...data };
    if ('heroHeadline' in sanitizedData && typeof sanitizedData.heroHeadline === 'string') {
        sanitizedData.heroHeadline = DOMPurify.sanitize(sanitizedData.heroHeadline);
    }
    if ('footerText' in sanitizedData && typeof sanitizedData.footerText === 'string') {
        sanitizedData.footerText = DOMPurify.sanitize(sanitizedData.footerText);
    }
    if ('faqs' in sanitizedData && Array.isArray(sanitizedData.faqs)) {
         sanitizedData.faqs = (sanitizedData.faqs as any[]).map(faq => ({
            ...faq,
            answer: DOMPurify.sanitize(faq.answer)
         }));
    }

    const currentSettings = await getSetting(key, {});
    const newSettings = { ...currentSettings, ...sanitizedData };
    await pool.query('REPLACE INTO settings (`key`, `value`) VALUES (?, ?)', [key, JSON.stringify(newSettings)]);
}

// --- Specific Settings Functions ---
export async function getSeoSettings(): Promise<SeoSettings> {
    return getSetting('seo', DEFAULT_SEO_SETTINGS);
}

export async function updateSeoSettings(data: Partial<SeoSettings>): Promise<void> {
    return updateSetting('seo', data);
}

export async function getLandingPageSettings(): Promise<LandingPageSettings> {
    return getSetting('landingPage', DEFAULT_LANDING_PAGE_SETTINGS);
}

export async function updateLandingPageSettings(data: Partial<LandingPageSettings>): Promise<void> {
    return updateSetting('landingPage', data);
}

// --- Payment Accounts ---
export async function getPaymentSettings(): Promise<PaymentAccount[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM payment_accounts ORDER BY bankName ASC');
        return rows as PaymentAccount[];
    } catch (error) {
        console.error("🔴 Gagal mengambil akun pembayaran:", error);
        throw error;
    }
}

export async function addPaymentAccount(data: Omit<PaymentAccount, 'id'>): Promise<void> {
    const id = `pa_${Date.now()}`;
    await pool.query('INSERT INTO payment_accounts (id, bankName, accountNumber, accountHolder) VALUES (?, ?, ?, ?)', [id, data.bankName, data.accountNumber, data.accountHolder]);
}

export async function updatePaymentAccount(id: string, data: Partial<Omit<PaymentAccount, 'id'>>): Promise<void> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    if (fields.length === 0) return;
    await pool.query(`UPDATE payment_accounts SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deletePaymentAccount(id: string): Promise<void> {
    await pool.query('DELETE FROM payment_accounts WHERE id = ?', [id]);
}

// --- Confirmation Contacts ---
export async function getConfirmationContacts(): Promise<ConfirmationContact[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM confirmation_contacts ORDER BY name ASC');
        return rows as ConfirmationContact[];
    } catch (error) {
        console.error("🔴 Gagal mengambil kontak konfirmasi:", error);
        throw error;
    }
}

export async function addConfirmationContact(data: Omit<ConfirmationContact, 'id'>): Promise<void> {
    const id = `cc_${Date.now()}`;
    await pool.query('INSERT INTO confirmation_contacts (id, name, whatsapp) VALUES (?, ?, ?)', [id, data.name, data.whatsapp]);
}

export async function updateConfirmationContact(id: string, data: Partial<Omit<ConfirmationContact, 'id'>>): Promise<void> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    if (fields.length === 0) return;
    await pool.query(`UPDATE confirmation_contacts SET ${fields} WHERE id = ?`, [...values, id]);
}

export async function deleteConfirmationContact(id: string): Promise<void> {
    await pool.query('DELETE FROM confirmation_contacts WHERE id = ?', [id]);
}

// --- Testimonials ---
export async function getAllTestimonials(): Promise<Testimonial[]> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT t.id, t.userId, u.name as userName, u.avatarUrl as userAvatar, u.role as userRole, t.quote, t.rating, t.createdAt
            FROM testimonials t
            JOIN users u ON t.userId = u.id
            ORDER BY t.createdAt DESC
        `);
        return rows as Testimonial[];
    } catch (error) {
        console.error("🔴 Peringatan di getAllTestimonials: Tidak dapat terhubung ke database. Mengembalikan array kosong.", error);
        return [];
    }
}

export async function getTestimonialByUserId(userId: string): Promise<Testimonial | null> {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM testimonials WHERE userId = ?', [userId]);
        if (rows.length === 0) return null;
        return rows[0] as Testimonial;
    } catch (error) {
        console.error(`🔴 Gagal mengambil testimoni untuk pengguna ${userId}:`, error);
        throw error;
    }
}

export async function addOrUpdateTestimonial(data: { userId: string, quote: string, rating: number }): Promise<void> {
    const existing = await getTestimonialByUserId(data.userId);
    const sanitizedQuote = DOMPurify.sanitize(data.quote);
    if (existing) {
        await pool.query('UPDATE testimonials SET quote = ?, rating = ?, createdAt = NOW() WHERE id = ?', [sanitizedQuote, data.rating, existing.id]);
    } else {
        const id = `test_${Date.now()}`;
        await pool.query('INSERT INTO testimonials (id, userId, quote, rating) VALUES (?, ?, ?, ?)', [id, data.userId, sanitizedQuote, data.rating]);
    }
}

export async function deleteTestimonial(id: string): Promise<void> {
    await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
}
