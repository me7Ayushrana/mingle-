import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  type: 'like' | 'pass' | 'superlike';
  comment?: string; // Optional prompt note or message
  promptId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['like', 'pass', 'superlike'], required: true },
    comment: { type: String, maxlength: 280 },
    promptId: { type: String },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate swipes from the same user to the same target
LikeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
