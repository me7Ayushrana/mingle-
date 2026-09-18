import { StyleSheet, View, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, Heading } from '@/components/ui/Text';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';

const BLUE = '#3B82F6';
const EMERALD = '#10B981';
const AMBER = '#F59E0B';

const MOCK_FEEDBACKS = [
  { id: '1', text: "You make me smile 😊", time: "2h ago", color: colors.primary },
  { id: '2', text: "You're so real", time: "5h ago", color: colors.primary },
  { id: '3', text: "I miss talking to you", time: "1d ago", color: BLUE },
  { id: '4', text: "Best vibes always ✨", time: "2d ago", color: EMERALD },
  { id: '5', text: "You always know how to make people feel heard.", time: "3d ago", color: AMBER },
  { id: '6', text: "Such a great friend!", time: "1w ago", color: colors.primary },
];

export default function FeedbacksScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.headerTitle}>Anonymous Feedbacks</Heading>
          <View style={styles.placeholder} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* ── Ask Me Anonymously Card ──────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <View style={styles.askCard}>
              <LinearGradient
                colors={['rgba(124,58,237,0.18)', 'rgba(59,130,246,0.10)']}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Top badge row */}
              <View style={styles.askBadgeRow}>
                <View style={styles.askBadge}>
                  <Ionicons name="heart-outline" size={14} color={colors.primary} />
                  <Text style={styles.askBadgeText}>Anonymous Feedback</Text>
                </View>
                <View style={styles.askLiveDot} />
              </View>

              {/* Headline */}
              <Heading level={2} style={styles.askTitle}>How do your friends{`\n`}really feel about you? 💌</Heading>
              <Text style={styles.askSubtitle}>
                Share a link — friends leave honest, anonymous feedback about you. No names, just truth.
              </Text>

              {/* Preview feedback chips */}
              <View style={styles.askPreviewRow}>
                {['You make me smile 😊', 'You\'re so real', 'I miss talking to you'].map((q) => (
                  <View key={q} style={styles.askPreviewChip}>
                    <Text style={styles.askPreviewChipText}>{q}</Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <Pressable
                style={styles.askCta}
                onPress={() =>
                  Share.share({
                    message: `Tell me anonymously how you feel about me 💌\nhttps://mingle.app/feedback/${user?.alias?.toLowerCase() || 'me'}`,
                    title: 'Anonymous Feedback',
                  })
                }
              >
                <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="link" size={18} color="white" />
                <Text style={styles.askCtaText}>Share My Feedback Link</Text>
                <Ionicons name="share-social" size={16} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.infoBanner}>
            <Ionicons name="heart-outline" size={24} color={colors.primary} />
            <Text style={styles.infoText}>These are honest, anonymous messages from your friends. They cannot be traced back.</Text>
          </Animated.View>

          <Text style={styles.sectionTitle}>Received Feedback</Text>

          <View style={styles.feedbacksList}>
            {MOCK_FEEDBACKS.map((fb, index) => (
              <Animated.View 
                key={fb.id} 
                entering={FadeInDown.duration(500).delay(200 + index * 100)} 
                style={[styles.feedbackCard, { borderColor: `${fb.color}30` }]}
              >
                <LinearGradient colors={[`${fb.color}15`, 'rgba(0,0,0,0)']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: `${fb.color}20` }]}>
                    <Ionicons name="chatbubble-outline" size={18} color={fb.color} />
                  </View>
                  <Text style={styles.timeText}>{fb.time}</Text>
                </View>
                <Text style={styles.feedbackText}>{fb.text}</Text>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.white },
  placeholder: { width: 40 }, // to balance the header

  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },

  // ── Ask Me Anonymously Card ───────────────────────────────
  askCard: {
    borderRadius: 28,
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  askBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  askBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  askBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  askLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EMERALD,
  },
  askTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginTop: 4,
  },
  askSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
  },
  askPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  askPreviewChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  askPreviewChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  askCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 14,
    marginTop: 4,
  },
  askCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,45,85,0.1)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,45,85,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },

  feedbacksList: {
    gap: spacing.lg,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrapper: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    lineHeight: 26,
  },
});
