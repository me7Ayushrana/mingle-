import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService } from '@/services/chat.service';
import { sanitizeText } from '@/utils/sanitize';

export const chatKeys = {
  conversations: ['chats'] as const,
  messages: (id: string) => ['chats', id, 'messages'] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: chatService.getConversations,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => chatService.getMessages(conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(conversationId, sanitizeText(content, 1000)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
    },
  });
}
