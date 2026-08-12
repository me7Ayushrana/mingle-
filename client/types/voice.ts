export interface VoiceParticipant {
  id: string;
  alias: string;
  avatarId: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
}

export interface VoiceRoom {
  id: string;
  title: string;
  topic?: string;
  hostAlias: string;
  hostAvatarId: string;
  participantsCount: number;
  participants: VoiceParticipant[];
  createdAt: string;
}
