import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { MoodType } from '../constants/moods';

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

export const usersService = {
  async getActiveUsers(): Promise<ActiveUser[]> {
    const { data } = await apiClient.get(endpoints.users.active);
    return data.data;
  },
  async searchUsers(query: string): Promise<any[]> {
    const { data } = await apiClient.get(endpoints.users.search, { params: { q: query } });
    return data.data;
  },
};
