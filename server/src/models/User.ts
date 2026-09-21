import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface IUserPrompt {
  id: string;
  promptId: string;
  question: string;
  answer: string;
}

export interface IUserLifestyle {
  drinking?: string;
  smoking?: string;
  workout?: string;
  pets?: string;
  zodiac?: string;
}

export interface IUserPreferences {
  ageMin?: number;
  ageMax?: number;
  distanceMax?: number;
  genderPreference?: string[];
  intentionPreference?: string[];
}

export interface IUserPrivacy {
  showOnline: boolean;
  showDistance: boolean;
  incognito: boolean;
}

export interface IUserNotificationPrefs {
  matches: boolean;
  messages: boolean;
  likes: boolean;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  username?: string;
  name?: string;
  alias?: string;
  avatarId?: string;
  gender?: string;
  pronouns?: string;
  dob?: string;
  age?: string;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  education?: string;
  occupation?: string;
  languages?: string[];
  photos?: IUserPhoto[];
  prompts?: IUserPrompt[];
  interests?: string[];
  hobbies?: string[];
  intention?: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  lifestyle?: IUserLifestyle;
  preferences?: IUserPreferences;
  privacy?: IUserPrivacy;
  notificationPreferences?: IUserNotificationPrefs;
  blockedUsers?: mongoose.Types.ObjectId[];
  mood?: string;
  needs?: string[];
  language?: string;
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
    name: { type: String },
    alias: { type: String },
    avatarId: { type: String, default: 'avatar-1' },
    gender: { type: String },
    pronouns: { type: String },
    dob: { type: String },
    age: { type: String },
    bio: { type: String, default: '' },
    location: {
      city: { type: String, default: 'San Francisco' },
      country: { type: String, default: 'United States' },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    education: { type: String, default: '' },
    occupation: { type: String, default: '' },
    languages: [{ type: String }],
    photos: [
      {
        id: { type: String },
        url: { type: String },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    prompts: [
      {
        id: { type: String },
        promptId: { type: String },
        question: { type: String },
        answer: { type: String },
      },
    ],
    interests: [{ type: String }],
    hobbies: [{ type: String }],
    intention: {
      type: String,
      enum: ['dating', 'friendship', 'casual', 'long_term', 'networking'],
      default: 'dating',
    },
    lifestyle: {
      drinking: { type: String, default: 'Socially' },
      smoking: { type: String, default: 'Never' },
      workout: { type: String, default: 'Active' },
      pets: { type: String, default: 'Dog lover' },
      zodiac: { type: String, default: '' },
    },
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 45 },
      distanceMax: { type: Number, default: 50 },
      genderPreference: [{ type: String }],
      intentionPreference: [{ type: String }],
    },
    privacy: {
      showOnline: { type: Boolean, default: true },
      showDistance: { type: Boolean, default: true },
      incognito: { type: Boolean, default: false },
    },
    notificationPreferences: {
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    mood: { type: String, default: 'reflective' },
    needs: [{ type: String }],
    language: { type: String, default: 'English' },
    reputation: { type: Number, default: 75 },
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
