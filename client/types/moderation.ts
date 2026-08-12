export type ReportReason =
  | 'harassment'
  | 'spam'
  | 'inappropriate'
  | 'impersonation'
  | 'other';

export interface ReportPayload {
  targetId: string;
  targetType: 'user' | 'moment' | 'message' | 'voice_room';
  reason: ReportReason;
  details?: string;
}

export interface ModerationAction {
  id: string;
  type: 'warn' | 'mute' | 'ban';
  createdAt: string;
}
