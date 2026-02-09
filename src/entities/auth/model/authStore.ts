import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserInfo } from '@shared/api';
import { TOKEN_KEY, USER_KEY } from '@shared/config';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: UserInfo) => void;
  setUser: (user: UserInfo) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token, user) => {
        localStorage.setItem(TOKEN_KEY, token);
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && !get().isAuthenticated) {
          set({ token, isAuthenticated: true });
        }
        set({ isLoading: false });
        return !!token;
      },
    }),
    {
      name: USER_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, set isLoading to false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
