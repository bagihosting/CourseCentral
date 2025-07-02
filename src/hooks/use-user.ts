'use client';

// This hook is deprecated. Please use the `useAuth` hook instead.
// import { useAuth } from '@/contexts/auth-context';
// export function useUser() {
//   return useAuth();
// }

import { useAuth } from "@/contexts/auth-context";

export function useUser() {
  return useAuth();
}
