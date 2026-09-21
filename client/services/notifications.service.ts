import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { InAppNotification } from '@/types/discovery';

const mockNotifications: InAppNotification[] = [
  {
    _id: 'notif-1',
    id: 'notif-1',
    userId: 'user-me',
    type: 'like',
    title: 'New Like! ✨',
    message: 'Elena liked your profile prompt.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: {
      fromUserId: 'user-disc-1',
      fromName: 'Elena Vance',
      fromAvatarId: 'avatar-2',
    },
  },
  {
    _id: 'notif-2',
    id: 'notif-2',
    userId: 'user-me',
    type: 'match',
    title: "It's a Match! 🎉",
    message: 'You and Julian matched! Say hello.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    data: {
      fromUserId: 'user-disc-2',
      fromName: 'Julian Chen',
      fromAvatarId: 'avatar-4',
    },
  },
];

export const notificationsService = {
  async getNotifications(): Promise<{ notifications: InAppNotification[]; unreadCount: number }> {
    if (env.useMockApi) {
      const unreadCount = mockNotifications.filter((n) => !n.read).length;
      return { notifications: mockNotifications, unreadCount };
    }
    try {
      const { data } = await apiClient.get(endpoints.matches.notifications);
      if (Array.isArray(data?.data)) {
        return {
          notifications: data.data,
          unreadCount: data.unreadCount || data.data.filter((n: any) => !n.read).length,
        };
      }
    } catch (err) {
      console.warn('getNotifications fallback:', err);
    }
    return {
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.read).length,
    };
  },

  async markAllAsRead(): Promise<void> {
    mockNotifications.forEach((n) => (n.read = true));
    if (!env.useMockApi) {
      try {
        await apiClient.post(endpoints.matches.readAllNotifications);
      } catch (err) {
        console.warn('markAllAsRead fallback:', err);
      }
    }
  },
};
