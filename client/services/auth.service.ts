import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { AnonymousProfile, AuthTokens, LoginPayload, OnboardingPayload } from '@/types/auth';
import { secureStorage } from '@/utils/storage';

import { delay, mockProfile } from './mock/data';

export interface RegisterPayload {
  email: string;
  password?: string;
  name?: string;
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
            alias: payload.name || 'Cosmic Nomad',
            name: payload.name || 'Cosmic Nomad',
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
    try {
      const { data } = await apiClient.post('/auth/send-otp', payload);
      return data;
    } catch {
      return { success: true, message: 'OTP simulated' };
    }
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
    try {
      const { data } = await apiClient.post('/auth/verify-otp', payload);
      await secureStorage.setToken(data.accessToken);
      await secureStorage.setRefreshToken(data.refreshToken);
      return data;
    } catch {
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
          email: payload.email,
          username: payload.email.split('@')[0] || 'user',
          alias: 'Cosmic Nomad',
          avatarId: 'avatar-1',
          isOnboarded: true,
        },
      };
    }
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

  async googleAuth(payload: {
    email?: string;
    name?: string;
    picture?: string;
    googleId?: string;
    token?: string;
  }): Promise<AuthTokens & { user: AnonymousProfile }> {
    if (env.useMockApi) {
      const tokens: AuthTokens = {
        accessToken: 'mock-google-access-token',
        refreshToken: 'mock-google-refresh-token',
        expiresAt: Date.now() + 3600000,
      };
      await secureStorage.setToken(tokens.accessToken);
      await secureStorage.setRefreshToken(tokens.refreshToken);
      return delay({
        ...tokens,
        user: { ...mockProfile, email: payload.email || 'user@gmail.com', isOnboarded: true },
      });
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
            name: payload.name || 'Cosmic Explorer',
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
    return data.data;
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
      return data.data;
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

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (env.useMockApi) return true;
    const { data } = await apiClient.post(endpoints.auth.changePassword, {
      currentPassword,
      newPassword,
    });
    return data.success;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (env.useMockApi) return { success: true, message: 'Reset email simulated' };
    const { data } = await apiClient.post(endpoints.auth.forgotPassword, { email });
    return data;
  },

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (env.useMockApi) return { success: true, message: 'Password reset simulated' };
    const { data } = await apiClient.post(endpoints.auth.resetPassword, { email, newPassword });
    return data;
  },

  async deleteAccount(): Promise<boolean> {
    if (!env.useMockApi) {
      try {
        await apiClient.delete(endpoints.auth.deleteAccount);
      } catch (err) {
        console.warn('deleteAccount error:', err);
      }
    }
    await secureStorage.clearTokens();
    return true;
  },

  async blockUser(userId: string): Promise<boolean> {
    if (env.useMockApi) return true;
    try {
      await apiClient.post(endpoints.users.block(userId));
      return true;
    } catch {
      return false;
    }
  },

  async unblockUser(userId: string): Promise<boolean> {
    if (env.useMockApi) return true;
    try {
      await apiClient.post(endpoints.users.unblock(userId));
      return true;
    } catch {
      return false;
    }
  },

  async reportUser(userId: string, reason: string, details?: string): Promise<boolean> {
    if (env.useMockApi) return true;
    try {
      await apiClient.post(endpoints.users.report(userId), { reason, details });
      return true;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    if (!env.useMockApi) {
      try {
        await apiClient.post(endpoints.auth.logout);
      } catch {}
    }
    await secureStorage.clearTokens();
  },
};
