import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Text, Heading } from '@/components/ui/Text';
import { useAuthSession } from '@/hooks/useAuth';
import { socketService } from '@/services/socket.service';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const Wave = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(progress.value, [0, 1], [1, 4]) }],
      opacity: interpolate(progress.value, [0, 0.8, 1], [0.8, 0, 0]),
    };
  });

  return <Animated.View style={[styles.wave, animatedStyle]} />;
};

type MatchStatus = 'searching' | 'sent' | 'matched' | 'no_match';

export default function FindingMatchScreen() {
  const router = useRouter();
  const { mood } = useLocalSearchParams<{ mood: string }>();
  const { user } = useAuthSession();

  const [status, setStatus] = useState<MatchStatus>('searching');
  const [sentCount, setSentCount] = useState(0);
  const matchedRef = useRef(false);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;
    matchedRef.current = false;

    // Register listeners FIRST, before emitting, to avoid race condition
    // where server responds before listener is ready

    // Listen for how many requests were sent
    const unsubResult = socketService.onFindMatchResult(({ sentCount: count }) => {
      if (count === 0) {
        setStatus('no_match');
      } else {
        setSentCount(count);
        setStatus('sent');
      }
    });

    // Listen for a successful match
    const unsubAccepted = socketService.onConnectRequestAccepted(({ chatId }) => {
      if (matchedRef.current) return;
      matchedRef.current = true;
      setStatus('matched');
      // Small delay so the user can see "Matched!" before navigating
      setTimeout(() => {
        router.replace(`/(app)/chat/${chatId}`);
      }, 800);
    });

    // NOW emit the find_match event (listeners are already active)
    socketService.findMatch(user.id, mood || 'any');

    // 15-second timeout: if no match by then, show "no match"
    const timeout = setTimeout(() => {
      if (!matchedRef.current) {
        setStatus((prev) => (prev === 'sent' || prev === 'searching' ? 'no_match' : prev));
      }
    }, 15000);

    return () => {
      unsubResult();
      unsubAccepted();
      clearTimeout(timeout);
    };
  }, [user?.id, mood, router]);

  const getStatusText = () => {
    switch (status) {
      case 'searching':
        return 'Scanning for active vibes...';
      case 'sent':
        return `Sent requests to ${sentCount} ${sentCount === 1 ? 'person' : 'people'}`;
      case 'matched':
        return 'Matched! Connecting...';
      case 'no_match':
        return 'No matches found right now.';
    }
  };

  const getSubtitleText = () => {
    switch (status) {
      case 'searching':
        return mood && mood !== 'any'
          ? `Looking for someone with a ${mood} vibe.`
          : 'Looking for someone with a matching vibe.';
      case 'sent':
        return 'Waiting for someone to accept...';
      case 'matched':
        return 'Starting your conversation!';
      case 'no_match':
        return 'Try again later or go to Explore to connect manually.';
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.cancelBtn}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        <View style={styles.container}>
          <View style={styles.radarContainer}>
            <Wave delay={0} />
            <Wave delay={1000} />
            <Wave delay={2000} />
            <View style={styles.avatarWrapper}>
              <Avatar
                avatarId={user?.avatarId || 'avatar-1'}
                alias={user?.alias || 'You'}
                size={96}
              />
            </View>
          </View>

          {/* Status Icon */}
          {status === 'matched' && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.matchedIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
            </Animated.View>
          )}
          {status === 'no_match' && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.matchedIcon}>
              <Ionicons name="sad-outline" size={48} color="rgba(255,255,255,0.4)" />
            </Animated.View>
          )}

          <View style={styles.textContainer}>
            <Heading level={2} style={styles.title}>
              {getStatusText()}
            </Heading>
            <Text style={styles.subtitle}>{getSubtitleText()}</Text>

            {status === 'sent' && (
              <Animated.View entering={FadeIn.duration(600).delay(200)} style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {sentCount} {sentCount === 1 ? 'request' : 'requests'} sent
                </Text>
              </Animated.View>
            )}
          </View>

          {status === 'no_match' && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.actionsContainer}>
              <Button
                title="Try Again"
                size="lg"
                onPress={() => {
                  setStatus('searching');
                  setSentCount(0);
                  if (user?.id) socketService.findMatch(user.id, mood || 'any');
                }}
                style={{ width: '100%', marginBottom: spacing.md }}
              />
              <Button
                title="Go Back"
                size="lg"
                variant="ghost"
                onPress={handleCancel}
                style={{ width: '100%' }}
              />
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    alignItems: 'flex-end',
  },
  cancelBtn: {
    padding: spacing.xs,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  radarContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  avatarWrapper: {
    zIndex: 10,
    backgroundColor: colors.background,
    borderRadius: 48,
    padding: 4,
  },
  wave: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 45, 85, 0.4)',
    zIndex: 1,
  },
  matchedIcon: {
    marginBottom: spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  countBadge: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 45, 85, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.3)',
  },
  countBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  actionsContainer: {
    width: '100%',
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
});
