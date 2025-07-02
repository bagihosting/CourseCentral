'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser } from '@/actions/auth';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const userData = await getUser();
      setUser(userData);
    }

    loadUser();
  }, []);

  return { user };
}
