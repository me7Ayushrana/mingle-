import { Routes } from '@/constants/routes';

export type AuthRedirect = 'auth' | 'onboarding' | 'app' | null;

export function resolveAuthRedirect(
  isLoading: boolean,
  isAuthenticated: boolean,
  isOnboarded: boolean,
): AuthRedirect {
  if (isLoading) return null;
  if (!isAuthenticated) return 'auth';
  if (!isOnboarded) return 'onboarding';
  return 'app';
}

export function getRedirectPath(redirect: AuthRedirect): string {
  switch (redirect) {
    case 'auth':
      return Routes.auth.welcome;
    case 'onboarding':
      return Routes.onboarding.avatarMood;
    case 'app':
      return Routes.app.home;
    default:
      return Routes.root;
  }
}
