import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

interface AmbientSoundPlayerProps {
  currentSound?: string;
  onChangeSound: (sound: string) => void;
}

const SOUNDS = [
  { id: 'none', label: 'Off', icon: 'volume-mute-outline' },
  { id: 'rain', label: 'Rain', icon: 'rainy-outline' },
  { id: 'lofi', label: 'Lofi', icon: 'musical-notes-outline' },
  { id: 'waves', label: 'Waves', icon: 'water-outline' },
];

export const AmbientSoundPlayer = ({ currentSound = 'none', onChangeSound }: AmbientSoundPlayerProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mood Radio:</Text>
      <View style={styles.chips}>
        {SOUNDS.map((s) => {
          const active = currentSound === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => onChangeSound(s.id)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Ionicons name={s.icon as any} size={12} color={active ? '#FFF' : 'rgba(255,255,255,0.6)'} />
              <Text style={[styles.chipText, active && styles.activeChipText]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginRight: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  activeChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
