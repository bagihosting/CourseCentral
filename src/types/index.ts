export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string; // e.g., "8 hours"
  imageUrl: string;
  category: string;
  materials?: {
    name: string;
    url: string;
    type: 'pdf' | 'zip' | 'video';
  }[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  membershipDuration?: number; // in months
  avatarUrl: string;
  skills: string[];
  courseProgress: Record<string, number>; // courseId: progress (0-100)
};
