import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { Routes } from '@/constants/routes';
import { authService } from '@/services/auth.service';
import { socketService } from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import type { LoginPayload, OnboardingPayload, VerifyOtpPayload } from '@/types/auth';
import { persistentStorage } from '@/utils/storage';
import { StorageKeys } from '@/constants/storage';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useAuthSession() {
  const { setUser, setLoading, isAuthenticated, isOnboarded, isLoading, user } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.me,
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    retry: false,
  });

  return { ...query, user, isAuthenticated, isOnboarded, isLoading, setUser, setLoading };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.sendOtp(payload),
  });
}

export function useVerifyOtp() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    onSuccess: (data) => {
      setUser(data.user);
      if (data.user.isOnboarded) {
        router.replace(Routes.app.home);
      } else {
        router.replace(Routes.onboarding.profileDetails);
      }
    },
  });
}

export function useCompleteOnboarding() {
  const setUser = useAuthStore((s) => s.setUser);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OnboardingPayload) => authService.completeOnboarding(payload),
    onSuccess: async (user) => {
      setUser(user);
      await setOnboarded(true);
      await persistentStorage.set(StorageKeys.alias, user.alias);
      resetOnboarding();
      queryClient.invalidateQueries({ queryKey: authKeys.me });
      router.replace(Routes.app.home);
    },
    onError: async (error, variables) => {
      console.warn('Onboarding error, applying fallback completion:', error);
      const currentUser = useAuthStore.getState().user;
      const completedUser = {
        id: currentUser?.id || `user_${Date.now()}`,
        email: currentUser?.email || 'user@mingle.app',
        username: variables.username || currentUser?.username || 'user',
        alias: variables.alias || currentUser?.alias || 'Cosmic Explorer',
        avatarId: variables.avatarId || currentUser?.avatarId || 'avatar-1',
        mood: variables.mood || 'happy',
        needs: variables.needs || ['chat'],
        language: variables.language || 'English',
        age: variables.age || '22',
        reputation: 100,
        createdAt: new Date().toISOString(),
        isOnboarded: true,
      };
      setUser(completedUser as any);
      await setOnboarded(true);
      await persistentStorage.set(StorageKeys.alias, completedUser.alias);
      resetOnboarding();
      router.replace(Routes.app.home);
    },
  });
}

export function useLogout() {
  const reset = useAuthStore((s) => s.reset);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      socketService.disconnect();
      reset();
      queryClient.clear();
      router.replace(Routes.auth.welcome);
    },
  });
}
