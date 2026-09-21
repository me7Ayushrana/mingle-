import { create } from 'zustand';
import type { MoodType } from '@/constants/moods';
import type { NeedType } from '@/constants/needs';
import type { UserProfilePhoto, UserProfilePrompt, UserProfileLifestyle } from '@/types/discovery';

export interface OnboardingState {
  // Step 1: Basics
  name: string;
  username: string;
  alias: string;
  gender: string;
  pronouns: string;
  dob: string;
  age: string;

  // Step 2: Photos & Avatar
  avatarId: string;
  photos: UserProfilePhoto[];

  // Step 3: Location, Work, Education & Bio
  city: string;
  country: string;
  education: string;
  occupation: string;
  languages: string[];
  bio: string;

  // Step 4: Intentions & Lifestyle
  intention: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  lifestyle: UserProfileLifestyle;

  // Step 5: Interests & Hobbies
  interests: string[];
  hobbies: string[];

  // Step 6: Prompts & Vibe
  prompts: UserProfilePrompt[];
  mood: MoodType;
  needs: NeedType[];

  // Actions
  setBasics: (data: {
    name: string;
    username: string;
    alias?: string;
    gender: string;
    pronouns?: string;
    dob?: string;
    age: string;
  }) => void;
  setAvatarId: (avatarId: string) => void;
  setPhotos: (photos: UserProfilePhoto[]) => void;
  addPhoto: (photo: UserProfilePhoto) => void;
  removePhoto: (id: string) => void;
  setPrimaryPhoto: (id: string) => void;
  setDetails: (data: {
    city?: string;
    country?: string;
    education?: string;
    occupation?: string;
    languages?: string[];
    bio?: string;
  }) => void;
  setIntention: (intention: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking') => void;
  setLifestyle: (lifestyle: Partial<UserProfileLifestyle>) => void;
  toggleInterest: (interest: string) => void;
  setPrompts: (prompts: UserProfilePrompt[]) => void;
  updatePrompt: (promptId: string, question: string, answer: string) => void;
  setMood: (mood: MoodType) => void;
  toggleNeed: (need: NeedType) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  name: '',
  username: '',
  alias: '',
  gender: 'Woman',
  pronouns: '',
  dob: '',
  age: '22',

  avatarId: 'avatar-1',
  photos: [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      isPrimary: true,
      order: 0,
    },
  ],

  city: 'San Francisco',
  country: 'United States',
  education: '',
  occupation: '',
  languages: ['English'],
  bio: '',

  intention: 'dating',
  lifestyle: {
    drinking: 'Socially',
    smoking: 'Never',
    workout: 'Active',
    pets: 'Dog lover',
    zodiac: '',
  },

  interests: ['Coffee', 'Design', 'Music', 'Travel'],
  hobbies: [],

  prompts: [
    {
      id: 'prompt-1',
      promptId: 'simple_pleasures',
      question: 'My simple pleasures in life...',
      answer: '',
    },
    {
      id: 'prompt-2',
      promptId: 'together_could',
      question: 'Together, we could...',
      answer: '',
    },
  ],
  mood: 'reflective',
  needs: [],

  setBasics: (data) =>
    set({
      name: data.name,
      username: data.username,
      alias: data.alias || data.name,
      gender: data.gender,
      pronouns: data.pronouns || '',
      dob: data.dob || '',
      age: data.age,
    }),

  setAvatarId: (avatarId) => set({ avatarId }),

  setPhotos: (photos) => set({ photos }),

  addPhoto: (photo) => {
    const { photos } = get();
    if (photos.length < 6) {
      set({ photos: [...photos, photo] });
    }
  },

  removePhoto: (id) => {
    const { photos } = get();
    const filtered = photos.filter((p) => p.id !== id);
    if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
      filtered[0]!.isPrimary = true;
    }
    set({ photos: filtered });
  },

  setPrimaryPhoto: (id) => {
    const { photos } = get();
    set({
      photos: photos.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      })),
    });
  },

  setDetails: (data) =>
    set((state) => ({
      city: data.city !== undefined ? data.city : state.city,
      country: data.country !== undefined ? data.country : state.country,
      education: data.education !== undefined ? data.education : state.education,
      occupation: data.occupation !== undefined ? data.occupation : state.occupation,
      languages: data.languages !== undefined ? data.languages : state.languages,
      bio: data.bio !== undefined ? data.bio : state.bio,
    })),

  setIntention: (intention) => set({ intention }),

  setLifestyle: (lifestyle) =>
    set((state) => ({
      lifestyle: { ...state.lifestyle, ...lifestyle },
    })),

  toggleInterest: (interest) => {
    const { interests } = get();
    if (interests.includes(interest)) {
      set({ interests: interests.filter((i) => i !== interest) });
    } else if (interests.length < 8) {
      set({ interests: [...interests, interest] });
    }
  },

  setPrompts: (prompts) => set({ prompts }),

  updatePrompt: (promptId, question, answer) => {
    const { prompts } = get();
    const existingIndex = prompts.findIndex((p) => p.promptId === promptId);
    if (existingIndex !== -1) {
      const updated = [...prompts];
      updated[existingIndex] = { id: prompts[existingIndex]!.id, promptId, question, answer };
      set({ prompts: updated });
    } else {
      set({
        prompts: [
          ...prompts,
          { id: `prompt-${Date.now()}`, promptId, question, answer },
        ],
      });
    }
  },

  setMood: (mood) => set({ mood }),

  toggleNeed: (need) => {
    const { needs } = get();
    if (needs.includes(need)) {
      set({ needs: needs.filter((n) => n !== need) });
    } else if (needs.length < 3) {
      set({ needs: [...needs, need] });
    }
  },

  reset: () =>
    set({
      name: '',
      username: '',
      alias: '',
      gender: 'Woman',
      pronouns: '',
      dob: '',
      age: '22',
      avatarId: 'avatar-1',
      photos: [],
      city: 'San Francisco',
      country: 'United States',
      education: '',
      occupation: '',
      languages: ['English'],
      bio: '',
      intention: 'dating',
      lifestyle: {
        drinking: 'Socially',
        smoking: 'Never',
        workout: 'Active',
        pets: 'Dog lover',
        zodiac: '',
      },
      interests: ['Coffee', 'Design', 'Music', 'Travel'],
      hobbies: [],
      prompts: [],
      mood: 'reflective',
      needs: [],
    }),
}));
