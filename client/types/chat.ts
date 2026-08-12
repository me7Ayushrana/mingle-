export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
  isMine: boolean;
  isIcebreaker?: boolean;
}

export interface MaskDropStatus {
  requestedBy: string[];
  isRevealed: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantAlias: string;
  participantAvatarId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline: boolean;
  expiresAt?: string;
  isExtended?: boolean;
  maskDropStatus?: MaskDropStatus;
  ambientSound?: string;
}
