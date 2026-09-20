import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AVATAR_OPTIONS, Avatar } from '@/components/ui/Avatar';
import { MoodChip } from '@/components/ui/MoodChip';
import { Text, Heading } from '@/components/ui/Text';
import { MOOD_OPTIONS } from '@/constants/moods';
import { useCompleteOnboarding } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/store/onboarding.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function AvatarMoodScreen() {
  const { username, alias, avatarId, mood, language, age, setAvatarId, setMood } =
    useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();

  const displayAlias = alias || 'You';

  const handleFinish = () => {
    if (!mood) return;
    completeOnboarding.mutate({
      username,
      alias,
      avatarId: avatarId || 'avatar-1',
      mood,
      language,
      age,
    });
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotCompleted]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View entering={FadeIn.duration(600)}>
            <Heading level={1} style={styles.title}>
              Your Identity & Vibe
            </Heading>
            <Text style={styles.subtitle}>
              Select your persona avatar and current vibe to start meeting people.
            </Text>
          </Animated.View>

          {/* Avatar Section */}
          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.section}>
            <Text style={styles.sectionLabel}>CHOOSE AVATAR ({AVATAR_OPTIONS.length} AVAILABLE)</Text>
            <View style={styles.sectionContent}>
              <FlatList
                data={AVATAR_OPTIONS}
                numColumns={4}
                scrollEnabled={false}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setAvatarId(item)}
                    style={[styles.avatarItem, avatarId === item && styles.avatarSelected]}
                  >
                    <Avatar avatarId={item} alias={displayAlias} size={64} />
                    {avatarId === item && (
                      <View style={styles.avatarCheck}>
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Animated.View>

          {/* Mood Section */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionLabel}>CURRENT VIBE</Text>
            <View style={[styles.sectionContent, styles.chips]}>
              {MOOD_OPTIONS.map((option) => (
                <MoodChip
                  key={option.id}
                  mood={option}
                  selected={mood === option.id}
                  onPress={setMood}
                />
              ))}
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInDown.duration(500).delay(450)} style={styles.footer}>
            <Pressable
              style={[styles.submitBtn, !mood && styles.submitBtnDisabled]}
              onPress={handleFinish}
              disabled={!mood || completeOnboarding.isPending}
            >
              {mood ? (
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              ) : null}
              {completeOnboarding.isPending ? (
                <Text style={styles.submitBtnText}>Setting up...</Text>
              ) : (
                <>
                  <Text style={[styles.submitBtnText, !mood && styles.submitBtnTextDisabled]}>
                    Enter Mingle
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={mood ? 'white' : 'rgba(255,255,255,0.3)'}
                  />
                </>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 520 },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepDotCompleted: {
    backgroundColor: colors.primary,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  sectionContent: {
    paddingTop: spacing.xs,
  },
  grid: {
    paddingVertical: spacing.xs,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  avatarItem: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    borderColor: colors.primary,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  submitBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
