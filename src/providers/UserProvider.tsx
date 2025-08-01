'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { FetchData } from '@/utils/Tools.tsx';

interface User {
  userIsStudent: boolean;
  userIsTeacher: boolean;
  userEmail: string;
  userImage: string;
  userName: string;
  userNumber: string;
}

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setUserImage: (image: string) => void;
  setUserName: (name: string) => void;
  setUserNumber: (number: string) => void;
  refetchUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => {},
  setUserImage: () => {},
  setUserName: () => {},
  setUserNumber: () => {},
  refetchUser: async () => {}
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await FetchData<{ success: boolean, user: User }>(
        '/api/auth/me',
        {},
        'GET'
      );
      if (response.success) {
        setUser(response.user);
        setError(null);
      } else {
        setError('Failed to load user data');
        setUser(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar los datos del usuario";
      setError(message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const setUserImage = (image: string) => {
    if (user) {
      setUser({ ...user, userImage: image });
    }
  };

  const setUserName = (name: string) => {
    if (user) {
      setUser({ ...user, userName: name });
    }
  };

  const setUserNumber = (number: string) => {
    if (user) {
      setUser({ ...user, userNumber: number });
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        setUser, 
        setUserImage,
        setUserName,
        setUserNumber,
        refetchUser: fetchUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
