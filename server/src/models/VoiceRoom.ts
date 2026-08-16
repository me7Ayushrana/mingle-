import mongoose, { Document, Schema } from 'mongoose';

export interface IVoiceRoom extends Document {
  title: string;
  topic?: string;
  mood: string;
  hostId: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceRoomSchema = new Schema<IVoiceRoom>(
  {
    title: { type: String, required: true },
    topic: { type: String },
    mood: { type: String, default: 'reflective' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isLive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const VoiceRoom = mongoose.model<IVoiceRoom>('VoiceRoom', VoiceRoomSchema);
