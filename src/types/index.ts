export type User = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  avatarUrl: string;
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
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'text' | 'zip';
  downloadable?: boolean;
};

export type Enrollment = {
  userId: string;
  courseId: string;
};
