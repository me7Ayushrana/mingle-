import { MoodType } from '@/constants/moods';
import { NeedType } from '@/constants/needs';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AnonymousProfile {
  id: string;
  email?: string;
  username: string;
  alias: string;
  avatarId: string;
  mood: MoodType;
  needs: NeedType[];
  language?: string;
  age?: string;
  reputation: number;
  badges?: string[];
  streakDays?: number;
  realIdentity?: {
    name?: string;
    contact?: string;
  };
  createdAt: string;
  isOnboarded: boolean;
}

export interface LoginPayload {
  identifier: string; // email or username
  password?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface OnboardingPayload {
  username: string;
  alias: string;
  avatarId: string;
  mood: MoodType;
  needs?: NeedType[];
  language?: string;
  age?: string;
}
