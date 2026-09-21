import { MoodType } from '@/constants/moods';

export interface UserProfilePhoto {
  id: string;
  url: string;
  isPrimary?: boolean;
  order?: number;
}

export interface UserProfilePrompt {
  id: string;
  promptId: string;
  question: string;
  answer: string;
}

export interface UserProfileLifestyle {
  drinking?: string;
  smoking?: string;
  workout?: string;
  pets?: string;
  zodiac?: string;
}

export interface DiscoveryProfile {
  id: string;
  userId?: string;
  name: string;
  username: string;
  alias?: string;
  avatarId: string;
  gender?: string;
  pronouns?: string;
  dob?: string;
  age: string;
  bio: string;
  location?: {
    city?: string;
    country?: string;
  };
  education?: string;
  occupation?: string;
  languages?: string[];
  photos: UserProfilePhoto[];
  prompts: UserProfilePrompt[];
  interests: string[];
  hobbies?: string[];
  intention: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  lifestyle?: UserProfileLifestyle;
  reputation?: number;
  mood?: MoodType;
}

export interface SwipeActionPayload {
  targetUserId: string;
  type: 'like' | 'pass' | 'superlike';
  comment?: string;
  promptId?: string;
}

export interface SwipeResponse {
  success: boolean;
  matched: boolean;
  message?: string;
  match?: {
    id: string;
    chatId: string;
    user: {
      id: string;
      name: string;
      avatarId: string;
      age: string;
      bio: string;
      photos: UserProfilePhoto[];
    };
  };
}

export interface MatchItem {
  id: string;
  chatId: string;
  user: {
    id: string;
    name: string;
    username?: string;
    alias?: string;
    avatarId: string;
    age: string;
    bio: string;
    photos: UserProfilePhoto[];
    location?: {
      city?: string;
      country?: string;
    };
    intention?: string;
    mood?: string;
  };
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId?: string;
  } | null;
  matchedAt: string;
  lastInteraction?: string;
}

export interface LikeReceivedItem {
  id: string;
  type: 'like' | 'superlike';
  comment?: string;
  promptId?: string;
  createdAt: string;
  user: DiscoveryProfile;
}

export interface InAppNotification {
  _id: string;
  id?: string;
  userId: string;
  type: 'match' | 'like' | 'message' | 'system';
  title: string;
  message: string;
  data?: {
    matchId?: string;
    chatId?: string;
    fromUserId?: string;
    fromName?: string;
    fromAvatarId?: string;
    fromPhoto?: string;
    comment?: string;
  };
  read: boolean;
  createdAt: string;
}
