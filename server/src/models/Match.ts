import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  chatId?: mongoose.Types.ObjectId;
  status: 'active' | 'unmatched' | 'blocked';
  unmatchedBy?: mongoose.Types.ObjectId;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
    status: { type: String, enum: ['active', 'unmatched', 'blocked'], default: 'active' },
    unmatchedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastInteraction: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

MatchSchema.index({ users: 1 });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
