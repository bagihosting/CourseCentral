export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  membershipDuration?: number; // in months
  avatarUrl: string;
  skills: string[];
};
