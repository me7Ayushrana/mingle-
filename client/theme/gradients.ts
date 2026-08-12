import { MoodType } from '@/constants/moods';

export const moodGradients: Record<MoodType, readonly [string, string, ...string[]]> = {
  calm: ['#0EA5E9', '#6366F1'],
  happy: ['#F59E0B', '#EC4899'],
  sad: ['#6366F1', '#312E81'],
  anxious: ['#8B5CF6', '#4C1D95'],
  lonely: ['#64748B', '#1E293B'],
  excited: ['#F97316', '#EF4444'],
  reflective: ['#14B8A6', '#6366F1'],
  hopeful: ['#10B981', '#3B82F6'],
};

export const defaultGradient = ['#8B5CF6', '#EC4899'] as const;

export const glassOverlay = 'rgba(10, 10, 15, 0.85)';
