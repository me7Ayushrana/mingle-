import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type { ChatMessage, Conversation } from '@/types/chat';

import { delay, mockConversations, mockMessages } from './mock/data';

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    if (env.useMockApi || env.isDev) {
      return delay(mockConversations);
    }
    const { data } = await apiClient.get(endpoints.chats.list);
    return data;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (env.useMockApi || env.isDev) {
      return delay(mockMessages[conversationId] ?? []);
    }
    const { data } = await apiClient.get(endpoints.chats.messages(conversationId));
    return data;
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    if (env.useMockApi || env.isDev) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: 'user-me',
        content,
        createdAt: new Date().toISOString(),
        status: 'sent',
        isMine: true,
      };
      const existing = mockMessages[conversationId] ?? [];
      mockMessages[conversationId] = [...existing, message];
      return delay(message);
    }
    const { data } = await apiClient.post(endpoints.chats.send(conversationId), { content });
    return data;
  },
};
