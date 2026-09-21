import { MoodType } from '@/constants/moods';
import { NeedType } from '@/constants/needs';
import { UserProfilePhoto, UserProfilePrompt, UserProfileLifestyle } from './discovery';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AnonymousProfile {
  id: string;
  email?: string;
  username: string;
  name?: string;
  alias: string;
  avatarId: string;
  gender?: string;
  pronouns?: string;
  dob?: string;
  age?: string;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  education?: string;
  occupation?: string;
  languages?: string[];
  photos?: UserProfilePhoto[];
  prompts?: UserProfilePrompt[];
  interests?: string[];
  hobbies?: string[];
  intention?: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  lifestyle?: UserProfileLifestyle;
  preferences?: {
    ageMin?: number;
    ageMax?: number;
    distanceMax?: number;
  };
  privacy?: {
    showOnline: boolean;
    showDistance: boolean;
    incognito: boolean;
  };
  notificationPreferences?: {
    matches: boolean;
    messages: boolean;
    likes: boolean;
  };
  mood: MoodType;
  needs: NeedType[];
  language?: string;
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
  name?: string;
  username: string;
  alias?: string;
  avatarId: string;
  gender?: string;
  pronouns?: string;
  dob?: string;
  age?: string;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  education?: string;
  occupation?: string;
  languages?: string[];
  photos?: UserProfilePhoto[];
  prompts?: UserProfilePrompt[];
  interests?: string[];
  hobbies?: string[];
  intention?: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  lifestyle?: UserProfileLifestyle;
  mood: MoodType;
  needs?: NeedType[];
  language?: string;
}
