import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  username?: string;
  alias?: string;
  avatarId?: string;
  mood?: string;
  needs?: string[];
  language?: string;
  age?: string;
  reputation: number;
  badges: string[];
  streakDays: number;
  lastVibeCheck?: Date;
  realIdentity?: {
    name?: string;
    contact?: string;
  };
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String, unique: true, sparse: true },
    alias: { type: String },
    avatarId: { type: String },
    mood: { type: String },
    needs: [{ type: String }],
    language: { type: String },
    age: { type: String },
    reputation: { type: Number, default: 50 },
    badges: [{ type: String, default: ['Newcomer'] }],
    streakDays: { type: Number, default: 1 },
    lastVibeCheck: { type: Date },
    realIdentity: {
      name: { type: String },
      contact: { type: String },
    },
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
