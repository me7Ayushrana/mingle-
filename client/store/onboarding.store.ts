import { create } from 'zustand';

import type { MoodType } from '@/constants/moods';
import type { NeedType } from '@/constants/needs';

interface ProfileDetailsData {
  username: string;
  alias: string;
  language: string;
  age: string;
}

interface OnboardingState {
  username: string;
  alias: string;
  avatarId: string;
  mood: MoodType | null;
  needs: NeedType[];
  language: string;
  age: string;
  setAlias: (alias: string) => void;
  setAvatarId: (avatarId: string) => void;
  setMood: (mood: MoodType) => void;
  toggleNeed: (need: NeedType) => void;
  setProfileDetails: (data: ProfileDetailsData) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  username: '',
  alias: '',
  avatarId: 'avatar-1',
  mood: null,
  needs: [],
  language: '',
  age: '',

  setAlias: (alias) => set({ alias }),
  setAvatarId: (avatarId) => set({ avatarId }),
  setMood: (mood) => set({ mood }),

  toggleNeed: (need) => {
    const { needs } = get();
    if (needs.includes(need)) {
      set({ needs: needs.filter((n) => n !== need) });
    } else if (needs.length < 3) {
      set({ needs: [...needs, need] });
    }
  },

  setProfileDetails: (data) =>
    set({
      username: data.username,
      alias: data.alias,
      language: data.language,
      age: data.age,
    }),

  reset: () =>
    set({
      username: '',
      alias: '',
      avatarId: 'avatar-1',
      mood: null,
      needs: [],
      language: '',
      age: '',
    }),
}));
