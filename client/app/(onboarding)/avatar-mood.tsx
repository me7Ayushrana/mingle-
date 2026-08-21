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

const BLUE = '#3B82F6';

export default function AvatarMoodScreen() {
  const { username, alias, avatarId, mood, language, age, setAvatarId, setMood } = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();

  const displayAlias = alias || 'You';

  const handleFinish = () => {
    if (!mood) return;
    completeOnboarding.mutate({
      username,
      alias,
      avatarId,
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
            <Heading level={1} style={styles.title}>Your Vibe</Heading>
            <Text style={styles.subtitle}>
              Choose an avatar and set your current mood to start matching.
            </Text>
          </Animated.View>

          {/* Avatar Section */}
          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.section}>
            <Text style={styles.sectionLabel}>CHOOSE AVATAR</Text>
            <View style={styles.sectionContent}>
              <FlatList
                data={AVATAR_OPTIONS}
                numColumns={3}
                scrollEnabled={false}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setAvatarId(item)}
                    style={[styles.avatarItem, avatarId === item && styles.avatarSelected]}
                  >
                    <Avatar avatarId={item} alias={displayAlias} size={80} />
                    {avatarId === item && (
                      <View style={styles.avatarCheck}>
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </Pressable>
                )}
              />
            </View>
          </Animated.View>

          {/* Mood Section */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionLabel}>CURRENT MOOD</Text>
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
                <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              ) : null}
              {completeOnboarding.isPending ? (
                <Text style={styles.submitBtnText}>Setting up...</Text>
              ) : (
                <>
                  <Text style={[styles.submitBtnText, !mood && styles.submitBtnTextDisabled]}>Complete Setup</Text>
                  <Ionicons name="sparkles" size={20} color={mood ? "white" : "rgba(255,255,255,0.3)"} />
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
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
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
    backgroundColor: BLUE,
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,45,85,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionContent: {
    paddingTop: spacing.xs,
  },
  grid: {
    paddingVertical: spacing.xs,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  avatarItem: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarSelected: {
    borderColor: colors.primary,
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
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
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  submitBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
