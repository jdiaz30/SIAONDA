import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Usuario {
  id: number;
  nombre: string;
  nombrecompleto: string;
  codigo: string;
  tipo: string;
  correo: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, usuario: Usuario) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, usuario) =>
        set({
          accessToken,
          refreshToken,
          usuario,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          usuario: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'siaonda-auth',
    }
  )
);
