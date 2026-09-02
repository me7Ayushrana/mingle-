import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { ICEBREAKER_QUESTIONS, IcebreakerQuestion } from '@/constants/icebreakers';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface IcebreakerDeckProps {
  onSelectQuestion: (question: string) => void;
}

export const IcebreakerDeck = ({ onSelectQuestion }: IcebreakerDeckProps) => {
  const [index, setIndex] = useState(0);
  const current: IcebreakerQuestion = ICEBREAKER_QUESTIONS[index % ICEBREAKER_QUESTIONS.length]!;

  const handleNext = () => {
    setIndex((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.badgeText}>Icebreaker • {current.category}</Text>
        </View>
        <Pressable onPress={handleNext} style={styles.shuffleBtn}>
          <Ionicons name="shuffle" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.shuffleText}>Shuffle</Text>
        </Pressable>
      </View>

      <Text style={styles.questionText}>&quot;{current.question}&quot;</Text>

      <Pressable onPress={() => onSelectQuestion(current.question)} style={styles.sendBtn}>
        <Ionicons name="paper-plane" size={14} color="#FFF" />
        <Text style={styles.sendBtnText}>Send to Chat</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 45, 85, 0.08)',
    borderColor: 'rgba(255, 45, 85, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shuffleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  questionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginVertical: 4,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
