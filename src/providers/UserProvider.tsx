'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FetchData } from '@/utils/Tools.tsx';

interface User {
  userIsStudent: boolean;
  userIsTeacher: boolean;
  userEmail: string;
  userImage: string;
  userName: string;
}

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  setUserImage: (image: string) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  setUserImage: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const setUserImage = (image: string) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, userImage: image };
    });
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await FetchData<{ success: boolean, user: User }>(
          '/api/auth/me', {}, 'GET');
        if (response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, setUserImage }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
