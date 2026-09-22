import { create } from 'zustand';

import type { AnonymousProfile } from '@/types/auth';
import { persistentStorage, secureStorage } from '@/utils/storage';
import { StorageKeys } from '@/constants/storage';
import { authService } from '@/services/auth.service';

const USER_STORAGE_KEY = 'mingle_auth_user';

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
  reset: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) => {
    if (user) {
      persistentStorage.set(USER_STORAGE_KEY, JSON.stringify(user)).catch(() => {});
    } else {
      persistentStorage.remove(USER_STORAGE_KEY).catch(() => {});
    }
    set({
      user,
      isAuthenticated: Boolean(user),
      isOnboarded: user?.isOnboarded ?? false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setOnboarded: async (value) => {
    await persistentStorage.setBoolean(StorageKeys.onboardingComplete, value);
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, isOnboarded: value };
      await persistentStorage.set(USER_STORAGE_KEY, JSON.stringify(updated));
      set({ user: updated, isOnboarded: value });
    } else {
      set({ isOnboarded: value });
    }
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

          await persistentStorage.set(USER_STORAGE_KEY, JSON.stringify(response.user));
          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isOnboarded: response.user.isOnboarded ?? true,
            isLoading: false,
          });
          return;
        }
      }

      // 2. Load cached credentials and profile
      const [token, cachedUserStr] = await Promise.all([
        secureStorage.getToken(),
        persistentStorage.get(USER_STORAGE_KEY),
      ]);

      let cachedUser: AnonymousProfile | null = null;
      if (cachedUserStr) {
        try {
          cachedUser = JSON.parse(cachedUserStr);
        } catch {}
      }

      if (!token && !cachedUser) {
        // No saved token and no cached user — user needs to log in
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      // If we have cached profile or token, IMMEDIATELY restore session so tab reopen is instant
      if (cachedUser) {
        set({
          user: cachedUser,
          token: token || 'cached_session_token',
          isAuthenticated: true,
          isOnboarded: cachedUser.isOnboarded ?? true,
          isLoading: false,
        });
      } else if (token) {
        set({
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      // 3. In background, refresh profile from server if token is available
      if (token) {
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            await persistentStorage.set(USER_STORAGE_KEY, JSON.stringify(freshUser));
            set({
              user: freshUser,
              isAuthenticated: true,
              isOnboarded: freshUser.isOnboarded ?? true,
              isLoading: false,
            });
          }
        } catch (err: any) {
          // If network error or temporary server issue, DO NOT log out! Keep cached user!
          console.warn('Silent session refresh skipped due to network/server response:', err?.message);
        }
      }
    } catch (err) {
      console.error('Hydration error:', err);
      set({ isLoading: false });
    }
  },

  reset: async () => {
    await Promise.all([
      secureStorage.clearTokens(),
      persistentStorage.remove(USER_STORAGE_KEY),
      persistentStorage.remove(StorageKeys.onboardingComplete),
    ]);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
    });
  },
}));
