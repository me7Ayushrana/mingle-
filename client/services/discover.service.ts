import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { PublicUser } from '@/types/user';

import { delay, mockSuggestedUsers } from './mock/data';

export const discoverService = {
  async getSuggested(): Promise<PublicUser[]> {
    if (env.useMockApi || env.isDev) {
      return delay(mockSuggestedUsers);
    }
    const { data } = await apiClient.get(endpoints.users.suggested);
    return data;
  },
};
