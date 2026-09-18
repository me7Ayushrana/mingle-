import { create } from 'zustand';

import type { MoodType } from '@/constants/moods';

interface MoodState {
  currentMood: MoodType | null;
  lastCheckIn: string | null;
  setMood: (mood: MoodType) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  currentMood: null,
  lastCheckIn: null,
  setMood: (mood) =>
    set({
      currentMood: mood,
      lastCheckIn: new Date().toISOString(),
    }),
}));
