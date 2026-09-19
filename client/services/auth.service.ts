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
    const { data } = await apiClient.post(endpoints.auth.register, payload);
    await secureStorage.setToken(data.accessToken);
    await secureStorage.setRefreshToken(data.refreshToken);
    return data;
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
    const { data } = await apiClient.post(endpoints.auth.login, payload);
    await secureStorage.setToken(data.accessToken);
    await secureStorage.setRefreshToken(data.refreshToken);
    return data;
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
    const { data } = await apiClient.post(endpoints.onboarding, payload);
    return data.data; // Server returns { success: true, data: { ... } }
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
