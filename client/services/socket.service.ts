import { io, Socket } from 'socket.io-client';

import { env } from '@/config/env';

type SocketEvents = {
  'chat:message': (payload: unknown) => void;
  'chat:typing': (payload: { conversationId: string; isTyping: boolean }) => void;
  receive_group_message: (payload: any) => void;
  active_users_updated: () => void;
  receive_connect_request: (payload: any) => void;
  connect_request_accepted: (payload: { chatId: string }) => void;
  connect_request_error: (payload: { requestId?: string; message: string }) => void;
  find_match_result: (payload: { sentCount: number }) => void;
  receive_chat_message: (payload: any) => void;
  'moment:created': (payload: any) => void;
  'moment:updated': (payload: { id: string; likes: number; comments: any[] }) => void;
};

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (!env.socketUrl) return;

    // If already connected, don't reconnect
    if (this.socket?.connected) return;

    // If there's a stale disconnected socket, clean it up
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.socket = io(env.socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }

  onConnect(callback: () => void) {
    if (!this.socket) return;
    if (this.socket.connected) {
      // Already connected, fire immediately
      callback();
    } else {
      // Wait for the connect event
      this.socket.once('connect', callback);
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]) {
    this.socket?.on(event, handler as any);
  }

  off<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]) {
    this.socket?.off(event, handler as any);
  }

  emit(event: string, payload?: unknown) {
    this.socket?.emit(event, payload);
  }

  joinGroupRoom(groupId: string) {
    this.emit('join_group_room', groupId);
  }

  joinRoom(roomId: string) {
    this.emit('join_room', roomId);
  }

  leaveGroupRoom(groupId: string) {
    this.emit('leave_group_room', groupId);
  }

  sendGroupMessage(payload: {
    groupId: string;
    senderId: string;
    text: string;
    senderAlias: string;
    senderUsername: string;
    senderAvatarId: string;
  }) {
    this.emit('send_group_message', payload);
  }

  onReceiveGroupMessage(handler: (msg: any) => void) {
    this.on('receive_group_message', handler);
    return () => this.off('receive_group_message', handler);
  }

  sendMessage(conversationId: string, content: string) {
    this.emit('chat:send', { conversationId, content });
  }

  // ── Explore / Active Users ──────────────────────────────────────

  registerUser(userId: string) {
    this.emit('register_user', userId);
  }

  toggleActive(userId: string, moodId: string, vibe: string, isActive: boolean) {
    this.emit('toggle_active', { userId, moodId, vibe, isActive });
  }

  onActiveUsersUpdated(handler: () => void) {
    this.on('active_users_updated', handler);
    return () => this.off('active_users_updated', handler);
  }

  sendConnectRequest(senderId: string, receiverId: string) {
    this.emit('send_connect_request', { senderId, receiverId });
  }

  onReceiveConnectRequest(handler: (payload: any) => void) {
    this.on('receive_connect_request', handler);
    return () => this.off('receive_connect_request', handler);
  }

  acceptConnectRequest(requestId: string) {
    this.emit('accept_connect_request', requestId);
  }

  declineConnectRequest(requestId: string) {
    this.emit('decline_connect_request', requestId);
  }

  onConnectRequestAccepted(handler: (payload: { chatId: string }) => void) {
    this.on('connect_request_accepted', handler);
    return () => this.off('connect_request_accepted', handler);
  }

  onConnectRequestError(handler: (payload: { requestId?: string; message: string }) => void) {
    this.on('connect_request_error', handler);
    return () => this.off('connect_request_error', handler);
  }

  // ── Matching ────────────────────────────────────────────────────

  findMatch(senderId: string, moodId: string) {
    this.emit('find_match', { senderId, moodId });
  }

  onFindMatchResult(handler: (payload: { sentCount: number }) => void) {
    this.on('find_match_result', handler);
    return () => this.off('find_match_result', handler);
  }

  // ── 1-on-1 Chat ────────────────────────────────────────────────

  joinChatRoom(chatId: string) {
    this.emit('join_chat_room', chatId);
  }

  leaveChatRoom(chatId: string) {
    this.emit('leave_chat_room', chatId);
  }

  sendChatMessage(payload: {
    chatId: string;
    senderId: string;
    text: string;
    senderAlias?: string;
    senderAvatarId?: string;
  }) {
    this.emit('send_chat_message', payload);
  }

  onReceiveChatMessage(handler: (msg: any) => void) {
    this.on('receive_chat_message', handler);
    return () => this.off('receive_chat_message', handler);
  }

  extendChatTimer(chatId: string) {
    this.emit('extend_chat_timer', { chatId });
  }

  onChatTimerExtended(handler: (data: { chatId: string; expiresAt: string }) => void) {
    this.socket?.on('chat_timer_extended', handler);
    return () => this.socket?.off('chat_timer_extended', handler);
  }

  requestMaskDrop(chatId: string, userId: string) {
    this.emit('request_mask_drop', { chatId, userId });
  }

  onMaskDropUpdated(handler: (data: { chatId: string; requestedBy: string[]; isRevealed: boolean }) => void) {
    this.socket?.on('mask_drop_updated', handler);
    return () => this.socket?.off('mask_drop_updated', handler);
  }

  changeAmbientSound(chatId: string, sound: string) {
    this.emit('change_ambient_sound', { chatId, sound });
  }

  onAmbientSoundChanged(handler: (data: { chatId: string; sound: string }) => void) {
    this.socket?.on('ambient_sound_changed', handler);
    return () => this.socket?.off('ambient_sound_changed', handler);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
