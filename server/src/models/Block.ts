import mongoose, { Document, Schema } from 'mongoose';

export interface IBlock extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export const Block = mongoose.model<IBlock>('Block', BlockSchema);
