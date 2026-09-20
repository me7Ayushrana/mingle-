import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { env } from '../config/env';

export interface ChatParticipant {
  _id: string;
  alias: string;
  username: string;
  avatarId: string;
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  lastMessageText?: string;
  lastMessageAt?: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: string | ChatParticipant;
  text: string;
  createdAt: string;
}

const mockDemoChats: Chat[] = [
  {
    _id: 'demo-chat-1',
    participants: [
      { _id: 'user-me', alias: 'Me', username: 'me', avatarId: 'avatar-1' },
      { _id: 'user-companion-1', alias: 'LunaEcho', username: 'lunaecho', avatarId: 'avatar-2' },
    ],
    lastMessageText: 'Hey there! Loved your recent moment about taking a quiet walk.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    _id: 'demo-chat-2',
    participants: [
      { _id: 'user-me', alias: 'Me', username: 'me', avatarId: 'avatar-1' },
      { _id: 'user-companion-2', alias: 'QuietRiver', username: 'quietriver', avatarId: 'avatar-3' },
    ],
    lastMessageText: 'Thanks for connecting! How is your day going so far?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

const mockDemoMessages: Record<string, ChatMessage[]> = {
  'demo-chat-1': [
    {
      _id: 'm-1',
      chatId: 'demo-chat-1',
      senderId: { _id: 'user-companion-1', alias: 'LunaEcho', username: 'lunaecho', avatarId: 'avatar-2' },
      text: 'Hey there! Loved your recent moment about taking a quiet walk.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
  'demo-chat-2': [
    {
      _id: 'm-2',
      chatId: 'demo-chat-2',
      senderId: { _id: 'user-companion-2', alias: 'QuietRiver', username: 'quietriver', avatarId: 'avatar-3' },
      text: 'Thanks for connecting! How is your day going so far?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
};

export const chatsService = {
  async getChats(): Promise<Chat[]> {
    if (env.useMockApi) {
      return mockDemoChats;
    }
    try {
      const { data } = await apiClient.get(endpoints.chats.list);
      if (Array.isArray(data?.data)) {
        return data.data;
      }
    } catch (err) {
      console.warn('getChats backend fallback to demo chats:', err);
    }
    return mockDemoChats;
  },

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    if (env.useMockApi) {
      return mockDemoMessages[chatId] || [];
    }
    try {
      const { data } = await apiClient.get(endpoints.chats.messages(chatId));
      if (Array.isArray(data?.data)) {
        return data.data;
      }
    } catch (err) {
      console.warn('getMessages backend fallback to demo messages:', err);
    }
    return mockDemoMessages[chatId] || [];
  },
};
