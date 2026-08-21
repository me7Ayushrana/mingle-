import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { moodGradients } from '@/theme/gradients';
import { colors } from '@/theme/colors';
import type { MoodType } from '@/constants/moods';

const AVATAR_COLORS: Record<string, readonly [string, string]> = {
  'avatar-1': ['#8B5CF6', '#EC4899'],
  'avatar-2': ['#0EA5E9', '#6366F1'],
  'avatar-3': ['#10B981', '#3B82F6'],
  'avatar-4': ['#F59E0B', '#EF4444'],
  'avatar-5': ['#14B8A6', '#8B5CF6'],
  'avatar-6': ['#64748B', '#1E293B'],
};

interface AvatarProps {
  avatarId: string;
  alias?: string;
  size?: number;
  mood?: MoodType;
  showOnline?: boolean;
}

export const Avatar = memo(function Avatar({
  avatarId,
  alias,
  size = 48,
  mood,
  showOnline,
}: AvatarProps) {
  const DEFAULT_GRADIENT = ['#8B5CF6', '#EC4899'] as const;

  const gradientColors =
    (mood ? moodGradients[mood] : AVATAR_COLORS[avatarId]) ?? DEFAULT_GRADIENT;
  const [colorStart, colorEnd] = gradientColors;

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={[colorStart ?? DEFAULT_GRADIENT[0], colorEnd ?? DEFAULT_GRADIENT[1]]}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }]}
      >
        <Image 
          source={{ uri: `https://api.dicebear.com/9.x/micah/png?seed=${avatarId}&backgroundColor=transparent` }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </LinearGradient>
      {showOnline ? <View style={[styles.online, { right: 0, bottom: 0 }]} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});

export const AVATAR_OPTIONS = Object.keys(AVATAR_COLORS);
