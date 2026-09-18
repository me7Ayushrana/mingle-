import { useMutation, useQuery } from '@tanstack/react-query';

import { voiceService } from '@/services/voice.service';
import { socketService } from '@/services/socket.service';

export const voiceKeys = {
  rooms: ['voice', 'rooms'] as const,
};

export function useVoiceRooms() {
  return useQuery({
    queryKey: voiceKeys.rooms,
    queryFn: voiceService.getRooms,
    refetchInterval: 30_000,
  });
}

export function useJoinVoiceRoom() {
  return useMutation({
    mutationFn: (roomId: string) => voiceService.joinRoom(roomId),
    onSuccess: (_data, roomId) => {
      socketService.joinRoom(roomId);
    },
  });
}
