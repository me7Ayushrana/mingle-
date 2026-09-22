import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MusicIcebreakerProps {
  suggestion: string;
  onUseSuggestion: (text: string) => void;
}

const PRIMARY = '#6C63FF';
const CARD_BG = 'rgba(255,255,255,0.04)';

export default function MusicIcebreaker({
  suggestion,
  onUseSuggestion,
}: MusicIcebreakerProps) {
  return (
    <TouchableOpacity
      onPress={() => onUseSuggestion(suggestion)}
      activeOpacity={0.75}
      style={styles.card}
    >
      {/* Purple left border accent */}
      <View style={styles.leftBar} />

      {/* Music note icon */}
      <View style={styles.iconWrapper}>
        <Ionicons name="musical-note" size={18} color={PRIMARY} />
      </View>

      {/* Suggestion text */}
      <Text style={styles.suggestionText} numberOfLines={3}>
        {suggestion}
      </Text>

      {/* Use this button */}
      <TouchableOpacity
        onPress={() => onUseSuggestion(suggestion)}
        style={styles.useBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Text style={styles.useBtnText}>Use this</Text>
        <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 10,
    overflow: 'hidden',
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: PRIMARY,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108,99,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  suggestionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 6,
    flexShrink: 0,
  },
  useBtnText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
});
