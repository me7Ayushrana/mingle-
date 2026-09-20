import { memo } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { colors } from '@/theme/colors';
import type { MoodType } from '@/constants/moods';

const AVATAR_SEEDS: Record<string, { seed: string; bg: string }> = {
  'avatar-1': { seed: 'Felix', bg: '#27272A' },
  'avatar-2': { seed: 'Aneka', bg: '#1E293B' },
  'avatar-3': { seed: 'Jasper', bg: '#1F242D' },
  'avatar-4': { seed: 'Maya', bg: '#262626' },
  'avatar-5': { seed: 'Oliver', bg: '#2D2D39' },
  'avatar-6': { seed: 'Sophia', bg: '#1E293B' },
  'avatar-7': { seed: 'Leo', bg: '#27272A' },
  'avatar-8': { seed: 'Zoe', bg: '#1F242D' },
  'avatar-9': { seed: 'Ethan', bg: '#262626' },
  'avatar-10': { seed: 'Aria', bg: '#2D2D39' },
  'avatar-11': { seed: 'Liam', bg: '#27272A' },
  'avatar-12': { seed: 'Chloe', bg: '#1E293B' },
  'avatar-13': { seed: 'Noah', bg: '#1F242D' },
  'avatar-14': { seed: 'Ava', bg: '#262626' },
  'avatar-15': { seed: 'Lucas', bg: '#2D2D39' },
  'avatar-16': { seed: 'Mila', bg: '#27272A' },
  'avatar-17': { seed: 'Mason', bg: '#1E293B' },
  'avatar-18': { seed: 'Luna', bg: '#1F242D' },
  'avatar-19': { seed: 'Logan', bg: '#262626' },
  'avatar-20': { seed: 'Ella', bg: '#2D2D39' },
  'avatar-21': { seed: 'Alexander', bg: '#27272A' },
  'avatar-22': { seed: 'Grace', bg: '#1E293B' },
  'avatar-23': { seed: 'James', bg: '#1F242D' },
  'avatar-24': { seed: 'Lily', bg: '#262626' },
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
  showOnline,
}: AvatarProps) {
  const avatarData = AVATAR_SEEDS[avatarId] ?? AVATAR_SEEDS['avatar-1'] ?? {
    seed: 'Felix',
    bg: '#27272A',
  };
  const seed = avatarData.seed;
  const bgColor = avatarData.bg;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            overflow: 'hidden',
          },
        ]}
      >
        <Image
          source={{
            uri: `https://api.dicebear.com/9.x/micah/png?seed=${seed}&backgroundColor=transparent`,
          }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      {showOnline ? <View style={[styles.online, { right: 0, bottom: 0 }]} /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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

export const AVATAR_OPTIONS = Object.keys(AVATAR_SEEDS);
