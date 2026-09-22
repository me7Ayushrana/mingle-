import mongoose, { Document, Schema } from 'mongoose';

export interface IMusicNote extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  mood?: string;
  // Optional Spotify track attachment
  trackId?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  spotifyUrl?: string;
  // Expiry
  expiresAt?: Date; // null = keep forever
  // Visibility
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MusicNoteSchema = new Schema<IMusicNote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 280 },
    mood: { type: String },
    trackId: { type: String },
    trackName: { type: String },
    artistName: { type: String },
    albumArt: { type: String },
    spotifyUrl: { type: String },
    expiresAt: { type: Date },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for efficient cleanup of expired notes
MusicNoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });
MusicNoteSchema.index({ userId: 1, createdAt: -1 });

MusicNoteSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MusicNote = mongoose.model<IMusicNote>('MusicNote', MusicNoteSchema);
