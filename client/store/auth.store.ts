import { create } from 'zustand';

import type { AnonymousProfile } from '@/types/auth';
import { persistentStorage, secureStorage } from '@/utils/storage';
import { StorageKeys } from '@/constants/storage';
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: AnonymousProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;
  setUser: (user: AnonymousProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (value: boolean) => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isOnboarded: user?.isOnboarded ?? false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setOnboarded: async (value) => {
    await persistentStorage.setBoolean(StorageKeys.onboardingComplete, value);
    set({ isOnboarded: value });
  },

  hydrate: async () => {
    try {
      const token = await secureStorage.getToken();

      if (!token) {
        // No saved token — user needs to log in
        set({ isLoading: false });
        return;
      }

      // Token exists — try to restore the session by fetching the user profile
      set({ token });

      const user = await authService.getMe();

      set({
        user,
        token,
        isAuthenticated: true,
        isOnboarded: user.isOnboarded ?? false,
        isLoading: false,
      });
    } catch {
      // Token is expired/invalid — clear everything and send to login
      await secureStorage.clearTokens();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isOnboarded: false,
        isLoading: false,
      });
    }
  },

  reset: async () => {
    await secureStorage.clearTokens();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
    });
  },
}));
