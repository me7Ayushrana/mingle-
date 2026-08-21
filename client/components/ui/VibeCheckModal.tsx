import React, { useState } from 'react';
import { StyleSheet, View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Heading } from '@/components/ui/Text';
import { MOOD_OPTIONS, MoodOption } from '@/constants/moods';
import { colors } from '@/theme/colors';

interface VibeCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveVibe: (moodId: string) => void;
  streakDays?: number;
}

export const VibeCheckModal = ({
  visible,
  onClose,
  onSaveVibe,
  streakDays = 1,
}: VibeCheckModalProps) => {
  const [selectedMood, setSelectedMood] = useState<string>('reflective');

  const handleComplete = () => {
    onSaveVibe(selectedMood);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#FF9500" />
            <Text style={styles.streakText}>{streakDays} Day Vibe Streak!</Text>
          </View>

          <Heading level={2} style={styles.title}>
            🕯️ Daily Vibe Check
          </Heading>
          <Text style={styles.subtitle}>How are you feeling right now?</Text>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((m: MoodOption) => {
              const active = selectedMood === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setSelectedMood(m.id)}
                  style={[styles.moodItem, active && styles.activeItem]}
                >
                  <Text style={styles.emoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, active && styles.activeLabel]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleComplete} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Log My Vibe</Text>
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,149,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  streakText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 22,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeItem: {
    backgroundColor: colors.primary,
  },
  emoji: {
    fontSize: 16,
  },
  moodLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  activeLabel: {
    color: '#FFF',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
