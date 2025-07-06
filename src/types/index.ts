

export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'member' | 'pro' | 'instructor';
  avatarUrl: string;
  whatsapp?: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'active' | 'inactive';
  loginCount: number;
  referralCode: string;
  referredBy?: string;
  affiliateBalance: number;
  affiliatePaid: number;
  instructorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  lessonsCreatedToday: number;
  lastLessonCreatedAt: string | null;
  customDomain: string | null;
};

export type RegisterUserInput = Omit<User, 'id' | 'role' | 'createdAt' | 'lastLoginAt' | 'status' | 'loginCount' | 'referralCode' | 'affiliateBalance' | 'affiliatePaid' | 'instructorStatus' | 'lessonsCreatedToday' | 'lastLessonCreatedAt' | 'customDomain'> & { referredBy?: string };
export type UpdateUserInput = Partial<Omit<User, 'id' | 'username' | 'createdAt' | 'lastLoginAt' | 'status' | 'loginCount' | 'referralCode' | 'referredBy' | 'affiliateBalance' | 'affiliatePaid' | 'instructorStatus' | 'lessonsCreatedToday' | 'lastLessonCreatedAt' | 'customDomain'>>;

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
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  authorId: string;
  reviewNotes?: string;
  updated_at: string;
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

export type InstructorApplication = {
  id: string;
  userId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  userName: string;
  userAvatar: string;
}

export type InstructorBranding = {
  userId: string;
  customDomain: string | null;
  brandName: string | null;
  brandLogoUrl: string | null;
  brandPrimaryColor: string | null;
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
  userRole: 'member' | 'pro' | 'instructor';
  quote: string;
  rating: number; // 1 to 5
  createdAt: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type AiApp = {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
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
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  faqs: FAQItem[];
  aiApps: AiApp[];
};

export type GenerateAppTopologyOutput = {
  appNameSuggestion: string;
  taglineSuggestion: string;
  coreFeatures: {
    feature: string;
    description: string;
  }[];
  techStack: string[];
  dataModel: {
    modelName: string;
    fields: string[];
  }[];
  userFlow: string;
};

export type CustomAppRequest = {
  id: string;
  userId: string;
  appName: string;
  appKeywords: string;
  topology: GenerateAppTopologyOutput;
  requestDate: string;
  status: 'pending_approval' | 'in_progress' | 'completed' | 'rejected';
  paymentDetails: {
    bankName: string;
    accountHolder: string;
  };
  adminNotes?: string;
  resultLink?: string;
};

export type WithdrawalRequest = {
    id: string;
    userId: string;
    amount: number;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
    processedAt?: string;
    adminNotes?: string;
};
