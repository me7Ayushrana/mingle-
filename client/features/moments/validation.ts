import { z } from 'zod';

import { MOOD_TYPES } from '@/constants/moods';

export const createMomentSchema = z.object({
  content: z
    .string()
    .min(1, 'Share something')
    .max(500, 'Keep it under 500 characters'),
  mood: z.enum(MOOD_TYPES),
});

export type CreateMomentFormData = z.infer<typeof createMomentSchema>;
