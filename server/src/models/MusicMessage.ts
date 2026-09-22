import mongoose, { Document, Schema } from 'mongoose';

export interface IMusicMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  // Spotify track data
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  // Optional short message with the song
  message?: string;
  // Reactions
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MusicMessageSchema = new Schema<IMusicMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    spotifyId: { type: String, required: true },
    trackName: { type: String, required: true },
    artistName: { type: String, required: true },
    albumArt: { type: String },
    spotifyUrl: { type: String, required: true },
    message: { type: String, maxlength: 200 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MusicMessageSchema.index({ chatId: 1, createdAt: -1 });

MusicMessageSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MusicMessage = mongoose.model<IMusicMessage>('MusicMessage', MusicMessageSchema);
