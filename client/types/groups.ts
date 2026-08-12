export interface Group {
  _id: string;
  name: string;
  description?: string;
  adminId: string | any;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  isMember?: boolean;
}

export interface GroupMessage {
  _id: string;
  groupId: string;
  senderId: {
    _id: string;
    alias: string;
    username: string;
    avatarId: string;
  };
  text: string;
  createdAt: string;
}

export interface GroupInvite {
  _id: string;
  groupId: {
    _id: string;
    name: string;
    description?: string;
  };
  inviterId: {
    _id: string;
    alias: string;
    username: string;
    avatarId: string;
  };
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
}
