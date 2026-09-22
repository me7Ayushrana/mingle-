import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedPlaylistTrack {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  addedBy: mongoose.Types.ObjectId;
  votes: mongoose.Types.ObjectId[];
  suggestedAt: Date;
}

export interface ISharedPlaylist extends Document {
  matchId: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  tracks: ISharedPlaylistTrack[];
  // If users authorized Spotify playlist creation
  spotifyPlaylistId?: string;
  spotifyPlaylistUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SharedPlaylistSchema = new Schema<ISharedPlaylist>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tracks: [
      {
        spotifyId: { type: String, required: true },
        trackName: { type: String, required: true },
        artistName: { type: String, required: true },
        albumArt: { type: String },
        spotifyUrl: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        suggestedAt: { type: Date, default: Date.now },
      },
    ],
    spotifyPlaylistId: { type: String },
    spotifyPlaylistUrl: { type: String },
  },
  { timestamps: true }
);

SharedPlaylistSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SharedPlaylist = mongoose.model<ISharedPlaylist>(
  'SharedPlaylist',
  SharedPlaylistSchema
);
