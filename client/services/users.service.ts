import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { MoodType } from '../constants/moods';
import { env } from '../config/env';

export interface ActiveUser {
  _id: string;
  userId: {
    _id: string;
    alias: string;
    username: string;
    avatarId: string;
  };
  moodId: MoodType;
  vibe: string;
  createdAt: string;
}

const mockActiveUsers: ActiveUser[] = [
  {
    _id: 'active-1',
    userId: { _id: 'user-1', alias: 'LunaEcho', username: 'lunaecho', avatarId: 'avatar-2' },
    moodId: 'reflective',
    vibe: 'Listening to rain and enjoying calm lo-fi vibes',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    _id: 'active-2',
    userId: { _id: 'user-2', alias: 'QuietRiver', username: 'quietriver', avatarId: 'avatar-3' },
    moodId: 'calm',
    vibe: 'Reading a book with chamomile tea',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    _id: 'active-3',
    userId: { _id: 'user-3', alias: 'SoftPixel', username: 'softpixel', avatarId: 'avatar-4' },
    moodId: 'excited',
    vibe: 'Coding on some late night creative ideas',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: 'active-4',
    userId: { _id: 'user-4', alias: 'NightBloom', username: 'nightbloom', avatarId: 'avatar-5' },
    moodId: 'hopeful',
    vibe: 'Stargazing from the rooftop terrace',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const usersService = {
  async getActiveUsers(): Promise<ActiveUser[]> {
    if (env.useMockApi) {
      return mockActiveUsers;
    }
    try {
      const { data } = await apiClient.get(endpoints.users.active);
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data;
      }
    } catch (err) {
      console.warn('getActiveUsers backend fallback to mock active users:', err);
    }
    return mockActiveUsers;
  },
  async searchUsers(query: string): Promise<any[]> {
    try {
      const { data } = await apiClient.get(endpoints.users.search, { params: { q: query } });
      return data?.data || [];
    } catch (err) {
      console.warn('searchUsers error:', err);
      return [];
    }
  },
};
