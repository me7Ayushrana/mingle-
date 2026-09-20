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
      // 1. Check if returning from Google OAuth redirect (hash contains access_token)
      if (
        typeof window !== 'undefined' &&
        window.location.hash &&
        window.location.hash.includes('access_token=')
      ) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        if (accessToken) {
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {}

          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const googleProfile = await userInfoRes.json();
          const email = googleProfile.email || 'user@gmail.com';
          const name = googleProfile.name || email.split('@')[0];

          const response = await authService.googleAuth({
            email,
            name,
            picture: googleProfile.picture,
            googleId: googleProfile.sub,
            token: accessToken,
          });

          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isOnboarded: response.user.isOnboarded ?? false,
            isLoading: false,
          });
          return;
        }
      }

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
