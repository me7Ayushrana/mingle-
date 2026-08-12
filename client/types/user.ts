import { MoodType } from '@/constants/moods';
import { NeedType } from '@/constants/needs';

export interface PublicUser {
  id: string;
  alias: string;
  avatarId: string;
  mood: MoodType;
  needs: NeedType[];
  reputation: number;
  matchScore?: number;
  isOnline?: boolean;
}

export interface UserProfile extends PublicUser {
  email?: string;
  momentsCount: number;
  connectionsCount: number;
  joinedAt: string;
  badges: string[];
}
