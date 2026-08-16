import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessageAt?: Date;
  lastMessageText?: string;
  expiresAt?: Date;
  isExtended?: boolean;
  maskDropStatus?: {
    requestedBy?: string[];
    isRevealed?: boolean;
  };
  ambientSound?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date },
    lastMessageText: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour ephemeral window
    },
    isExtended: { type: Boolean, default: false },
    maskDropStatus: {
      requestedBy: [{ type: String }],
      isRevealed: { type: Boolean, default: false },
    },
    ambientSound: { type: String, default: 'none' },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
