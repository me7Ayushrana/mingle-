import { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  withDelay,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { Text, Heading } from '@/components/ui/Text';
import { MoodChip } from '@/components/ui/MoodChip';
import { MOOD_OPTIONS, MoodType } from '@/constants/moods';
import { Routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const { width } = Dimensions.get('window');

export default function MatchingScreen() {
  const router = useRouter();
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | 'any'>('any');

  const handleStartSearch = () => {
    router.push({ pathname: Routes.app.findingMatch, params: { mood: selectedMood } });
    setShowMoodSelector(false);
  };

  const handleShowMoodSelector = () => {
    setShowMoodSelector(true);
  };

  // Chats Button
  const handleOpenChats = () => {
    router.push('/(app)/chats');
  };

  // Slide button logic with dynamic width measurement
  const [trackWidth, setTrackWidth] = useState(0);
  const effectiveSlideDistance = trackWidth > 0 
    ? Math.max(50, trackWidth - 56 - spacing.sm * 2) 
    : Math.min(Math.max(100, width - spacing['2xl'] * 2 - 56 - spacing.sm * 2), 260);

  const slideDistanceShared = useSharedValue(effectiveSlideDistance);
  useEffect(() => {
    slideDistanceShared.value = effectiveSlideDistance;
  }, [effectiveSlideDistance, slideDistanceShared]);

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const maxDist = slideDistanceShared.value;
      let newVal = startX.value + event.translationX;
      if (newVal < 0) newVal = 0;
      if (newVal > maxDist) newVal = maxDist;
      translateX.value = newVal;
    })
    .onEnd(() => {
      const maxDist = slideDistanceShared.value;
      if (translateX.value > maxDist * 0.6) {
        translateX.value = withTiming(maxDist, {}, (finished) => {
          if (finished) {
            runOnJS(handleShowMoodSelector)();
            translateX.value = withDelay(400, withTiming(0, { duration: 300 }));
          }
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Subtle floating animations for the cards and icons
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const chevronAnim = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    float2.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    chevronAnim.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [chevronAnim, float1, float2]);

  const useChevronStyle = (index: number) => {
    return useAnimatedStyle(() => {
      // Offset each chevron's animation phase so they light up sequentially
      const phase = (chevronAnim.value - index * 0.2 + 1) % 1;
      return {
        opacity: interpolate(phase, [0, 0.5, 1], [0.1, 1, 0.1]),
        transform: [{ translateX: interpolate(phase, [0, 1], [0, 10]) }],
      };
    });
  };

  const chevronStyle1 = useChevronStyle(0);
  const chevronStyle2 = useChevronStyle(1);
  const chevronStyle3 = useChevronStyle(2);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: float1.value }, { rotate: '-12deg' }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: float2.value }, { rotate: '15deg' }],
  }));

  return (
    <GestureHandlerRootView style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Title */}
          <Animated.View
            entering={FadeIn.duration(600).easing(Easing.out(Easing.quad))}
            style={styles.header}
          >
            <View style={styles.headerLeft} />
            <Heading level={1} style={styles.mainTitle}>
              Mingle
            </Heading>
            <Pressable onPress={handleOpenChats} style={styles.headerRight}>
              <Ionicons name="chatbubbles-outline" size={28} color="white" />
            </Pressable>
          </Animated.View>

          {/* Hero Cards Area (Clean - without floating badges) */}
          <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.heroArea}>
            {/* Left Card */}
            <Animated.View style={[styles.card, styles.leftCard, animatedStyle1]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
                }}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradientOverlay}
              />
            </Animated.View>

            {/* Right Card */}
            <Animated.View style={[styles.card, styles.rightCard, animatedStyle2]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
                }}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradientOverlay}
              />
            </Animated.View>
          </Animated.View>

          {/* Typography */}
          <Animated.View entering={FadeIn.duration(600).delay(400)} style={styles.textSection}>
            <Text style={styles.discoverText}>
              Discover Real People{'\n'}
              <Text style={styles.highlightText}>Match</Text> Instantly
            </Text>
            <Text style={styles.subtitleText}>
              Like profiles you&apos;re interested in and get matched instantly when the feeling is
              mutual.
            </Text>
          </Animated.View>

          {/* Bottom Action Button (Supports Slide and Direct Tap) */}
          <Animated.View entering={FadeIn.duration(600).delay(600)} style={styles.actionSection}>
            <Pressable
              style={styles.customButton}
              onPress={handleShowMoodSelector}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            >
              <Text style={styles.buttonText}>Slide to Find Match</Text>

              <View style={styles.chevronGroup}>
                <Animated.View style={chevronStyle1}>
                  <Ionicons name="chevron-forward-outline" size={20} color="white" />
                </Animated.View>
                <Animated.View style={[chevronStyle2, { marginLeft: -10 }]}>
                  <Ionicons name="chevron-forward-outline" size={20} color="white" />
                </Animated.View>
                <Animated.View style={[chevronStyle3, { marginLeft: -10 }]}>
                  <Ionicons name="chevron-forward-outline" size={20} color="white" />
                </Animated.View>
              </View>

              <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.buttonIconCircle, thumbStyle]}>
                  <Ionicons name="heart" size={24} color="white" />
                </Animated.View>
              </GestureDetector>
            </Pressable>
          </Animated.View>

          {/* Mood Selector Overlay */}
          {showMoodSelector && (
            <Animated.View
              entering={SlideInDown.duration(400).springify()}
              exiting={SlideOutDown.duration(300)}
              style={styles.blurOverlayWrapper}
            >
              <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
                <Pressable
                  style={styles.blurOverlayClose}
                  onPress={() => setShowMoodSelector(false)}
                />
                <View style={styles.moodSheet}>
                  <View style={styles.sheetHandle} />
                  <Heading level={2} style={styles.sheetTitle}>
                    What&apos;s your vibe?
                  </Heading>
                  <Text style={styles.sheetSubtitle}>
                    Choose the kind of connection you&apos;re looking for right now.
                  </Text>

                  <View style={styles.moodGrid}>
                    <Pressable
                      onPress={() => setSelectedMood('any')}
                      style={[
                        styles.anyMoodChip,
                        selectedMood === 'any' && styles.anyMoodChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.anyMoodText,
                          selectedMood === 'any' && styles.anyMoodTextSelected,
                        ]}
                      >
                        ✨ Surprise Me
                      </Text>
                    </Pressable>
                    {MOOD_OPTIONS.map((mood) => (
                      <MoodChip
                        key={mood.id}
                        mood={mood}
                        selected={selectedMood === mood.id}
                        onPress={(id) => setSelectedMood(id as MoodType)}
                      />
                    ))}
                  </View>

                  <Pressable onPress={handleStartSearch} style={styles.findMatchBtnContainer}>
                    <LinearGradient
                      colors={colors.primaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.findMatchBtnGradient}
                    >
                      <Text style={styles.findMatchBtnText}>Find Match</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </BlurView>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const CARD_WIDTH = width * 0.45;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    width: '100%',
  },
  headerLeft: {
    width: 48,
  },
  headerRight: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  glowCircle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  heroArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  cardGradient: {
    flex: 1,
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  leftCard: {
    left: '10%',
    zIndex: 1,
  },
  rightCard: {
    right: '10%',
    zIndex: 2,
    marginTop: 40,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  discoverText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 40,
  },
  highlightText: {
    color: colors.primary,
  },
  subtitleText: {
    marginTop: spacing.xl,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: '100%',
    height: 72,
    borderRadius: 36,
    paddingHorizontal: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonIconCircle: {
    position: 'absolute',
    left: spacing.sm,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    zIndex: 1,
  },
  chevronGroup: {
    position: 'absolute',
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  blurOverlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurOverlayClose: {
    flex: 1,
  },
  moodSheet: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  anyMoodChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anyMoodChipSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  anyMoodText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  anyMoodTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  findMatchBtnContainer: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  findMatchBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: spacing.sm,
  },
  findMatchBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
