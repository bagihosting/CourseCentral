'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser as fetchUser, getAllUsers } from '@/lib/data';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      // This is a client-side hook, so we fetch the user data.
      // In a real app, this might involve an API call or reading from a client-side store.
      const userData = await fetchUser();
      
      // Since getUser() can return any user, we simulate getting the logged in one.
      // We will just pick the first user from the list based on the role.
      if (userData?.role) {
        const allUsers = await getAllUsers();
        const loggedInUser = allUsers.find(u => u.role === userData.role);
        setUser(loggedInUser || null);
      } else {
        setUser(null)
      }
    }

    loadUser();
  }, []);

  return { user };
}
