import mongoose, { Document, Schema } from 'mongoose';

export interface ISpotifyTrack {
  spotifyId: string;
  name: string;
  artistName: string;
  artistId?: string;
  albumName?: string;
  albumArt?: string;
  spotifyUrl: string;
  previewUrl?: string;
  durationMs?: number;
}

export interface ISpotifyArtist {
  spotifyId: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  spotifyUrl: string;
  popularity?: number;
}

export interface ISpotifyPlaylist {
  spotifyId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  spotifyUrl: string;
  trackCount?: number;
  isPublic: boolean;
  isSelectedForProfile: boolean; // user explicitly chose to show this
}

export interface ICurrentListening {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  sharedAt: Date;
  isActive: boolean;
  shortMessage?: string; // optional "currently thinking about..." text
}

export interface ISongOfTheDay {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  setAt: Date;
}

export interface IMusicPrivacy {
  showCurrentlyPlaying: boolean;
  showTopArtists: boolean;
  showTopTracks: boolean;
  showPlaylists: boolean;
  showMusicChemistry: boolean;
  allowDiscoverUsers: boolean;
  allowMatchedUsers: boolean;
  showVoiceIntro: boolean;
  voiceIntroMatchesOnly: boolean;
}

export interface IMusicProfile extends Document {
  userId: mongoose.Types.ObjectId;
  spotifyConnected: boolean;
  topArtists: ISpotifyArtist[];
  topTracks: ISpotifyTrack[];
  recentlyPlayed: ISpotifyTrack[];
  favoriteGenres: string[]; // auto-derived + manually added
  playlists: ISpotifyPlaylist[];
  currentListening?: ICurrentListening;
  songOfTheDay?: ISongOfTheDay;
  privacy: IMusicPrivacy;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpotifyTrackSchema = new Schema<ISpotifyTrack>(
  {
    spotifyId: { type: String, required: true },
    name: { type: String, required: true },
    artistName: { type: String, required: true },
    artistId: { type: String },
    albumName: { type: String },
    albumArt: { type: String },
    spotifyUrl: { type: String, required: true },
    previewUrl: { type: String },
    durationMs: { type: Number },
  },
  { _id: false }
);

const SpotifyArtistSchema = new Schema<ISpotifyArtist>(
  {
    spotifyId: { type: String, required: true },
    name: { type: String, required: true },
    genres: [{ type: String }],
    imageUrl: { type: String },
    spotifyUrl: { type: String, required: true },
    popularity: { type: Number },
  },
  { _id: false }
);

const MusicProfileSchema = new Schema<IMusicProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    spotifyConnected: { type: Boolean, default: false },
    topArtists: [SpotifyArtistSchema],
    topTracks: [SpotifyTrackSchema],
    recentlyPlayed: [SpotifyTrackSchema],
    favoriteGenres: [{ type: String }],
    playlists: [
      {
        spotifyId: { type: String },
        name: { type: String },
        description: { type: String },
        coverImageUrl: { type: String },
        spotifyUrl: { type: String },
        trackCount: { type: Number },
        isPublic: { type: Boolean, default: true },
        isSelectedForProfile: { type: Boolean, default: false },
      },
    ],
    currentListening: {
      spotifyId: { type: String },
      trackName: { type: String },
      artistName: { type: String },
      albumArt: { type: String },
      spotifyUrl: { type: String },
      sharedAt: { type: Date },
      isActive: { type: Boolean, default: false },
      shortMessage: { type: String },
    },
    songOfTheDay: {
      spotifyId: { type: String },
      trackName: { type: String },
      artistName: { type: String },
      albumArt: { type: String },
      spotifyUrl: { type: String },
      setAt: { type: Date },
    },
    privacy: {
      showCurrentlyPlaying: { type: Boolean, default: false },
      showTopArtists: { type: Boolean, default: true },
      showTopTracks: { type: Boolean, default: true },
      showPlaylists: { type: Boolean, default: true },
      showMusicChemistry: { type: Boolean, default: true },
      allowDiscoverUsers: { type: Boolean, default: true },
      allowMatchedUsers: { type: Boolean, default: true },
      showVoiceIntro: { type: Boolean, default: true },
      voiceIntroMatchesOnly: { type: Boolean, default: false },
    },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

MusicProfileSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MusicProfile = mongoose.model<IMusicProfile>('MusicProfile', MusicProfileSchema);
