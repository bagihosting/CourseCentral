export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'member' | 'pro';
  avatarUrl: string;
  whatsapp?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  imageUrl: string;
  modules: Module[];
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
  userName: string;
  userAvatar: string;
  bankName: string;
  accountHolder: string;
  requestDate: string;
  status: 'pending' | 'approved';
};
