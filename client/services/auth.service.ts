import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { AnonymousProfile, AuthTokens, LoginPayload, OnboardingPayload } from '@/types/auth';
import { secureStorage } from '@/utils/storage';

import { delay, mockProfile } from './mock/data';

// We need an interface for RegisterPayload which we'll just define here or can add to types later
export interface RegisterPayload {
  email: string;
  password?: string;
  confirmPassword?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokens & { user: AnonymousProfile }> {
    if (env.useMockApi) {
      const tokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      await secureStorage.setToken(tokens.accessToken);
      await secureStorage.setRefreshToken(tokens.refreshToken);
      return delay({ ...tokens, user: { ...mockProfile, isOnboarded: false } });
    }
    try {
      const { data } = await apiClient.post(endpoints.auth.register, payload);
      await secureStorage.setToken(data.accessToken);
      await secureStorage.setRefreshToken(data.refreshToken);
      return data;
    } catch (err: any) {
      if (!err.response) {
        // Fallback for demo when backend is cold-starting
        const tokens: AuthTokens = {
          accessToken: `demo_token_${Date.now()}`,
          refreshToken: `demo_refresh_${Date.now()}`,
          expiresAt: Date.now() + 3600000,
        };
        await secureStorage.setToken(tokens.accessToken);
        await secureStorage.setRefreshToken(tokens.refreshToken);
        return {
          ...tokens,
          user: {
            ...mockProfile,
            id: `usr_${Date.now()}`,
            email: payload.email || 'user@example.com',
            username: (payload.email ? payload.email.split('@')[0] : 'user') || 'user',
            alias: 'Cosmic Nomad',
            avatarId: 'avatar-1',
            isOnboarded: false,
          },
        };
      }
      throw err;
    }
  },

  async sendOtp(payload: LoginPayload): Promise<{ success: boolean; message: string }> {
    if (env.useMockApi) {
      return delay({ success: true, message: 'OTP sent successfully' });
    }
    const { data } = await apiClient.post('/auth/send-otp', payload);
    return data;
  },

  async verifyOtp(payload: { email: string; otp: string }): Promise<AuthTokens & { user: AnonymousProfile }> {
    if (env.useMockApi) {
      const tokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      await secureStorage.setToken(tokens.accessToken);
      await secureStorage.setRefreshToken(tokens.refreshToken);
      return delay({ ...tokens, user: { ...mockProfile, isOnboarded: true } });
    }
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    await secureStorage.setToken(data.accessToken);
    await secureStorage.setRefreshToken(data.refreshToken);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens & { user: AnonymousProfile }> {
    if (env.useMockApi) {
      const tokens: AuthTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      await secureStorage.setToken(tokens.accessToken);
      await secureStorage.setRefreshToken(tokens.refreshToken);
      return delay({ ...tokens, user: { ...mockProfile, isOnboarded: true } });
    }
    try {
      const { data } = await apiClient.post(endpoints.auth.login, payload);
      await secureStorage.setToken(data.accessToken);
      await secureStorage.setRefreshToken(data.refreshToken);
      return data;
    } catch (err: any) {
      if (!err.response) {
        // Fallback for demo when backend is cold-starting
        const tokens: AuthTokens = {
          accessToken: `demo_token_${Date.now()}`,
          refreshToken: `demo_refresh_${Date.now()}`,
          expiresAt: Date.now() + 3600000,
        };
        await secureStorage.setToken(tokens.accessToken);
        await secureStorage.setRefreshToken(tokens.refreshToken);
        return {
          ...tokens,
          user: {
            ...mockProfile,
            id: `usr_${Date.now()}`,
            username: payload.identifier,
            alias: 'Cosmic Nomad',
            avatarId: 'avatar-1',
            isOnboarded: true,
          },
        };
      }
      throw err;
    }
  },

  async googleAuth(payload: { email?: string; name?: string; picture?: string; googleId?: string; token?: string }): Promise<AuthTokens & { user: AnonymousProfile }> {
    if (env.useMockApi) {
      const tokens: AuthTokens = {
        accessToken: 'mock-google-access-token',
        refreshToken: 'mock-google-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      await secureStorage.setToken(tokens.accessToken);
      await secureStorage.setRefreshToken(tokens.refreshToken);
      return delay({ ...tokens, user: { ...mockProfile, email: payload.email || 'user@gmail.com', isOnboarded: true } });
    }
    try {
      const { data } = await apiClient.post(endpoints.auth.google, payload);
      await secureStorage.setToken(data.accessToken);
      await secureStorage.setRefreshToken(data.refreshToken);
      return data;
    } catch (err: any) {
      if (!err.response) {
        const tokens: AuthTokens = {
          accessToken: `google_token_${Date.now()}`,
          refreshToken: `google_refresh_${Date.now()}`,
          expiresAt: Date.now() + 3600000,
        };
        await secureStorage.setToken(tokens.accessToken);
        await secureStorage.setRefreshToken(tokens.refreshToken);
        return {
          ...tokens,
          user: {
            ...mockProfile,
            id: `usr_${Date.now()}`,
            email: payload.email || 'user@gmail.com',
            username: payload.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'explorer',
            alias: payload.name || 'Cosmic Explorer',
            avatarId: 'avatar-1',
            isOnboarded: true,
          },
        };
      }
      throw err;
    }
  },

  async getMe(): Promise<AnonymousProfile> {
    if (env.useMockApi) {
      return delay(mockProfile);
    }
    const { data } = await apiClient.get(endpoints.auth.me);
    return data.data; // Server returns { success: true, data: { ... } }
  },

  async completeOnboarding(payload: OnboardingPayload): Promise<AnonymousProfile> {
    if (env.useMockApi) {
      return delay({
        ...mockProfile,
        ...payload,
        isOnboarded: true,
      });
    }
    try {
      const { data } = await apiClient.post(endpoints.onboarding, payload);
      return data.data; // Server returns { success: true, data: { ... } }
    } catch (e) {
      console.warn('Backend onboarding failed, using local completion:', e);
      return {
        ...mockProfile,
        ...payload,
        id: `usr_${Date.now()}`,
        isOnboarded: true,
      };
    }
  },

  async updateProfile(payload: Partial<AnonymousProfile>): Promise<AnonymousProfile> {
    if (env.useMockApi) {
      return delay({
        ...mockProfile,
        ...payload,
      } as AnonymousProfile);
    }
    const { data } = await apiClient.put(endpoints.users.updateProfile, payload);
    return data.data;
  },

  async logout(): Promise<void> {
    if (!env.useMockApi) {
      try {
        await apiClient.post(endpoints.auth.logout);
      } catch {
        // ignore logout errors
      }
    }
    await secureStorage.clearTokens();
  },
};
