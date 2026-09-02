import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

interface EphemeralTimerBadgeProps {
  expiresAt?: string;
  isExtended?: boolean;
  onExtendTimer: () => void;
}

export const EphemeralTimerBadge = ({
  expiresAt,
  isExtended,
  onExtendTimer,
}: EphemeralTimerBadgeProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('24h 00m');

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="time-outline" size={14} color={colors.primary} />
        <Text style={styles.timerText}>Connection expires in {timeLeft}</Text>
      </View>
      <Pressable
        onPress={onExtendTimer}
        disabled={isExtended}
        style={[styles.extendBtn, isExtended && styles.disabledBtn]}
      >
        <Ionicons name={isExtended ? 'checkmark-circle' : 'add-circle-outline'} size={14} color="#FFF" />
        <Text style={styles.extendText}>{isExtended ? 'Extended (+24h)' : 'Extend +24h'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  extendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  extendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
});
