import mongoose, { Document, Schema } from 'mongoose';

export interface IVoiceIntro extends Document {
  userId: mongoose.Types.ObjectId;
  // Base64 audio stored in DB (suitable for short 5-15s clips ≤2MB)
  audioData: string;
  mimeType: string; // 'audio/m4a' | 'audio/aac' | 'audio/mp4' | 'audio/wav'
  durationSeconds: number;
  // Privacy
  isPublic: boolean;
  matchesOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceIntroSchema = new Schema<IVoiceIntro>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    audioData: { type: String, required: true }, // base64 encoded
    mimeType: { type: String, default: 'audio/m4a' },
    durationSeconds: { type: Number, required: true, min: 1, max: 30 },
    isPublic: { type: Boolean, default: true },
    matchesOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VoiceIntroSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const VoiceIntro = mongoose.model<IVoiceIntro>('VoiceIntro', VoiceIntroSchema);
