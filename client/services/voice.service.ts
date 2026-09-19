import type { VoiceRoom } from '@/types/voice';

export const voiceService = {
  async getRooms(): Promise<VoiceRoom[]> {
    return [];
  },
  async joinRoom(roomId: string): Promise<{ token?: string; roomId: string }> {
    return { roomId };
  },
};
