export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'member' | 'pro';
  avatarUrl: string;
  whatsapp?: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'inactive';
  loginCount: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  imageUrl: string;
  modules: Module[];
  accessLevel: 'public' | 'pro';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

export type Module = {
  id:string;
  title: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'youtube' | 'text' | 'zip';
  contentUrl?: string;
  content?: string;
  downloadable?: boolean;
};

export type Enrollment = {
  userId: string;
  courseId: string;
};

export type UpgradeRequest = {
  id: string;
  userId: string;
  bankName: string;
  accountHolder: string;
  requestDate: string;
  status: 'pending' | 'approved';
};

export type CertificateRequest = {
  id: string;
  userId: string;
  courseId: string;
  requestDate: string;
  status: 'pending' | 'approved';
  certificateHtml?: string;
  approvedAt?: string;
};

export type PaymentAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export type ConfirmationContact = {
  id: string;
  name: string;
  whatsapp: string;
};

export type SeoSettings = {
  platformName: string;
  titleSuffix: string;
  metaDescription: string;
  metaKeywords: string;
  enableAiSuggestions?: boolean;
};

export type Testimonial = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: 'member' | 'pro';
  quote: string;
  rating: number; // 1 to 5
  createdAt: string;
};

export type LandingPageSettings = {
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  logoUrl: string;
  footerText: string;
  featuredTestimonialIds: string[];
};
