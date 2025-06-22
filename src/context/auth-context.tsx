'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createContext } from 'react';

import { ISession, IUser } from '@/db';

export interface AuthContextType {
  user: IUser | undefined;
  session: ISession | null;
  loading?: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const fetchSessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await axios.get('/api/auth/me');
      return data;
    },
  });

  const logoutSession = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post('/api/auth/logout');
      return data;
    },
    onSuccess: () => {
      fetchSessionQuery.refetch();
      router.refresh();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: fetchSessionQuery.data?.user,
        session: fetchSessionQuery.data?.session || null,
        loading: fetchSessionQuery.isLoading,
        logout: logoutSession.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
