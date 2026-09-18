export const MOOD_TYPES = [
  'calm',
  'happy',
  'sad',
  'anxious',
  'lonely',
  'excited',
  'reflective',
  'hopeful',
] as const;

export type MoodType = (typeof MOOD_TYPES)[number];

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji: string;
  description: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'calm', label: 'Calm', emoji: '🌊', description: 'Peaceful and centered' },
  { id: 'happy', label: 'Happy', emoji: '✨', description: 'Light and uplifted' },
  { id: 'sad', label: 'Sad', emoji: '🌧️', description: 'Heavy or low' },
  { id: 'anxious', label: 'Anxious', emoji: '⚡', description: 'Restless or worried' },
  { id: 'lonely', label: 'Lonely', emoji: '🌙', description: 'Craving connection' },
  { id: 'excited', label: 'Excited', emoji: '🔥', description: 'Energized and alive' },
  { id: 'reflective', label: 'Reflective', emoji: '🪞', description: 'Thoughtful and inward' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌱', description: 'Open to what’s next' },
];
