import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { MusicMessage } from '@/types/music';

export const musicMessagesService = {
  async getMessages(chatId: string): Promise<MusicMessage[]> {
    try {
      const { data } = await apiClient.get(endpoints.musicMessages.list(chatId));
      return data.data || [];
    } catch {
      return [];
    }
  },

  async sendSong(
    chatId: string,
    track: {
      spotifyId: string;
      trackName: string;
      artistName: string;
      albumArt?: string;
      spotifyUrl: string;
    },
    message?: string
  ): Promise<MusicMessage> {
    const { data } = await apiClient.post(endpoints.musicMessages.send(chatId), {
      ...track,
      message,
    });
    return data.data;
  },

  async toggleLike(chatId: string, msgId: string): Promise<{ liked: boolean; likesCount: number }> {
    const { data } = await apiClient.post(endpoints.musicMessages.like(chatId, msgId));
    return { liked: data.liked, likesCount: data.likesCount };
  },
};
