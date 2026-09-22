import mongoose, { Document, Schema } from 'mongoose';

export interface ISpotifyConnection extends Document {
  userId: mongoose.Types.ObjectId;
  spotifyId: string;
  displayName?: string;
  email?: string;
  country?: string;
  product?: string; // 'free' | 'premium'
  profileImageUrl?: string;
  spotifyProfileUrl?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scopes: string[];
  isActive: boolean;
  connectedAt: Date;
  disconnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpotifyConnectionSchema = new Schema<ISpotifyConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    spotifyId: { type: String, required: true },
    displayName: { type: String },
    email: { type: String },
    country: { type: String },
    product: { type: String },
    profileImageUrl: { type: String },
    spotifyProfileUrl: { type: String },
    // Tokens stored server-side only — never exposed to client
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiresAt: { type: Date, required: true },
    scopes: [{ type: String }],
    isActive: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now },
    disconnectedAt: { type: Date },
  },
  { timestamps: true }
);

SpotifyConnectionSchema.set('toJSON', {
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    // NEVER expose tokens in JSON responses
    delete ret.accessToken;
    delete ret.refreshToken;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SpotifyConnection = mongoose.model<ISpotifyConnection>(
  'SpotifyConnection',
  SpotifyConnectionSchema
);
