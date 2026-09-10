import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { CreateMomentPayload, Moment } from '@/types/moment';

import { delay, mockMoments } from './mock/data';

export const momentsService = {
  async getFeed(): Promise<Moment[]> {
    if (env.useMockApi) {
      return delay(mockMoments as unknown as Moment[]);
    }
    const { data } = await apiClient.get(endpoints.moments.list);
    return data.data; // Server returns { success: true, data: [...] }
  },

  async createMoment(payload: CreateMomentPayload): Promise<Moment> {
    if (env.useMockApi) {
      return delay({} as Moment); // mocked fallback
    }
    const { data } = await apiClient.post(endpoints.moments.create, payload);
    return data.data;
  },

  async toggleLike(id: string): Promise<Moment> {
    if (env.useMockApi) {
      return delay({} as Moment); // mocked fallback
    }
    const { data } = await apiClient.post(endpoints.moments.like(id));
    return data.data;
  },

  async addComment(id: string, text: string): Promise<Moment> {
    if (env.useMockApi) {
      return delay({} as Moment); // mocked fallback
    }
    const { data } = await apiClient.post(endpoints.moments.comment(id), { text });
    return data.data;
  },
};
