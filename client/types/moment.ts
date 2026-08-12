import { MoodType } from '@/constants/moods';

export interface Comment {
  id: string;
  author: string;
  avatarId: string;
  text: string;
  timestamp: string;
}

export interface MomentAuthor {
  name: string;
  handle: string;
  avatarId: string;
}

export interface Moment {
  id: string;
  author?: MomentAuthor;
  authorId?: string;
  authorAlias?: string;
  authorAvatarId?: string;
  content: string;
  mood?: MoodType;
  timestamp?: string;
  createdAt?: string;
  likes: number;
  likesCount?: number;
  comments: Comment[];
  commentsCount?: number;
  isLiked: boolean;
  isMine?: boolean;
}

export interface CreateMomentPayload {
  content: string;
  mood?: MoodType;
}
