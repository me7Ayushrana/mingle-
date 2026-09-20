import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth.store';
import type { CreateMomentPayload, Moment } from '@/types/moment';
import { mockMoments } from './mock/data';

// In-memory persistent cache so moments survive navigations seamlessly
let cachedMoments: Moment[] = [...(mockMoments as unknown as Moment[])];

export const momentsService = {
  async getFeed(): Promise<Moment[]> {
    if (env.useMockApi) {
      return [...cachedMoments];
    }
    try {
      const { data } = await apiClient.get(endpoints.moments.list);
      if (Array.isArray(data?.data)) {
        // Merge any locally posted moments that aren't on the server yet
        const serverIds = new Set(data.data.map((m: Moment) => m.id));
        const localOnly = cachedMoments.filter((m) => !serverIds.has(m.id) && m.isMine);
        cachedMoments = [...localOnly, ...data.data];
        return cachedMoments;
      }
    } catch (error) {
      console.warn('Backend moments fetch fallback to local cache:', error);
    }
    return [...cachedMoments];
  },

  async createMoment(payload: CreateMomentPayload): Promise<Moment> {
    const user = useAuthStore.getState().user;
    const authorName = user?.alias || user?.username || 'Me';
    const authorAvatar = user?.avatarId || 'avatar-1';
    const authorHandle = user?.username
      ? `@${user.username}`
      : `@${authorName.toLowerCase().replace(/\s+/g, '')}`;

    const localMoment: Moment = {
      id: `moment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: {
        name: authorName,
        handle: authorHandle,
        avatarId: authorAvatar,
      },
      authorId: user?.id || 'user-me',
      authorAlias: authorName,
      authorAvatarId: authorAvatar,
      content: payload.content,
      mood: payload.mood,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      isLiked: false,
      isMine: true,
    };

    if (!env.useMockApi) {
      try {
        const { data } = await apiClient.post(endpoints.moments.create, payload);
        if (data?.data) {
          const created: Moment = {
            ...data.data,
            isMine: true,
            authorAlias: data.data.authorAlias || authorName,
            authorAvatarId: data.data.authorAvatarId || authorAvatar,
            author: data.data.author || {
              name: authorName,
              handle: authorHandle,
              avatarId: authorAvatar,
            },
            comments: Array.isArray(data.data.comments) ? data.data.comments : [],
            likes: typeof data.data.likes === 'number' ? data.data.likes : 0,
          };
          cachedMoments = [created, ...cachedMoments.filter((m) => m.id !== created.id)];
          return created;
        }
      } catch (error) {
        console.warn('Backend createMoment failed, using instant local post fallback:', error);
      }
    }

    cachedMoments = [localMoment, ...cachedMoments];
    return localMoment;
  },

  async toggleLike(id: string): Promise<Moment> {
    let updatedMoment: Moment | undefined;
    const momentIndex = cachedMoments.findIndex((m) => m.id === id);
    if (momentIndex !== -1) {
      const m = cachedMoments[momentIndex]!;
      const currentLiked = Boolean(m.isLiked);
      const currentLikes = typeof m.likes === 'number' ? m.likes : 0;
      const newLiked = !currentLiked;
      const newLikes = Math.max(0, currentLikes + (newLiked ? 1 : -1));
      updatedMoment = {
        ...m,
        isLiked: newLiked,
        likes: newLikes,
        likesCount: newLikes,
      };
      cachedMoments[momentIndex] = updatedMoment;
    }

    if (!env.useMockApi) {
      try {
        const { data } = await apiClient.post(endpoints.moments.like(id));
        if (data?.data) {
          if (momentIndex !== -1) {
            cachedMoments[momentIndex] = data.data;
          }
          return data.data;
        }
      } catch (error) {
        console.warn('Backend toggleLike fallback to local state:', error);
      }
    }

    return updatedMoment || ({} as Moment);
  },

  async addComment(id: string, text: string): Promise<Moment> {
    const user = useAuthStore.getState().user;
    const authorName = user?.alias || user?.username || 'Me';
    const authorAvatar = user?.avatarId || 'avatar-1';
    const newComment = {
      id: `comment-${Date.now()}`,
      author: authorName,
      avatarId: authorAvatar,
      text,
      timestamp: new Date().toISOString(),
    };

    let updatedMoment: Moment | undefined;
    const momentIndex = cachedMoments.findIndex((m) => m.id === id);
    if (momentIndex !== -1) {
      const m = cachedMoments[momentIndex]!;
      const comments = Array.isArray(m.comments) ? [...m.comments, newComment] : [newComment];
      updatedMoment = {
        ...m,
        comments,
        commentsCount: comments.length,
      };
      cachedMoments[momentIndex] = updatedMoment;
    }

    if (!env.useMockApi) {
      try {
        const { data } = await apiClient.post(endpoints.moments.comment(id), { text });
        if (data?.data) {
          if (momentIndex !== -1) {
            cachedMoments[momentIndex] = data.data;
          }
          return data.data;
        }
      } catch (error) {
        console.warn('Backend addComment fallback to local state:', error);
      }
    }

    return updatedMoment || ({} as Moment);
  },
};
