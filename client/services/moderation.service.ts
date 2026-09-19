import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { ReportPayload } from '@/types/moderation';

export const moderationService = {
  async report(payload: ReportPayload): Promise<{ success: boolean }> {
    if (env.useMockApi || env.isDev) {
      return new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 300),
      );
    }
    const { data } = await apiClient.post(endpoints.moderation.report, payload);
    return data;
  },
};
