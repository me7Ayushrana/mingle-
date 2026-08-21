import { StyleSheet, View, Pressable, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, Heading } from '@/components/ui/Text';
import { Routes } from '@/constants/routes';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* ── Hero Area ───────────────────────────────────── */}
          <View style={styles.heroArea}>
            <Animated.View entering={FadeIn.duration(800)} style={styles.logoRow}>
              <Text style={styles.logo}>mingle.</Text>
            </Animated.View>

            {/* Floating illustration area */}
            <View style={styles.illustrationArea}>
              {/* Floating Cards with Images (Clean - No symbols/badges) */}
              <Animated.View entering={FadeIn.duration(800).delay(200)} style={[styles.card, styles.leftCard]}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80' }} 
                  style={styles.cardImage} 
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradientOverlay} />
              </Animated.View>
              
              <Animated.View entering={FadeIn.duration(800).delay(300)} style={[styles.card, styles.rightCard]}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80' }} 
                  style={styles.cardImage} 
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradientOverlay} />
              </Animated.View>
            </View>

            {/* Title area */}
            <Animated.View entering={FadeInDown.duration(600).delay(400)}>
              <Heading level={1} style={styles.title}>
                Authentic expression,{'\n'}zero judgment.
              </Heading>
              <Text style={styles.subtitle}>
                Connect based on how you feel. Chat safely with real people, anonymously.
              </Text>
            </Animated.View>

            {/* Feature pills (Clean - without icons) */}
            <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.featurePills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>100% Anonymous</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Instant Matching</Text>
              </View>
            </Animated.View>
          </View>

          {/* ── Bottom Actions ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.actions}>
            <Pressable style={styles.primaryBtn} onPress={() => router.push(Routes.auth.register)}>
              <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              <Text style={styles.primaryBtnText}>Create Account</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={() => router.push(Routes.auth.login)}>
              <Text style={styles.secondaryBtnText}>Already have an account? <Text style={styles.linkText}>Log In</Text></Text>
            </Pressable>

            <Text style={styles.tos}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const CARD_W = width * 0.4;
const CARD_H = CARD_W * 1.25;

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    justifyContent: 'space-between',
  },

  // ── Hero ──────────────────────────────────────────────
  heroArea: { flex: 1 },
  logoRow: { marginTop: spacing['2xl'] },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  illustrationArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  card: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  cardImage: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  leftCard: { left: '8%', transform: [{ rotate: '-12deg' }], zIndex: 1 },
  rightCard: { right: '8%', transform: [{ rotate: '10deg' }], zIndex: 2, marginTop: 30 },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.md,
  },

  // ── Feature pills ─────────────────────────────────────
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // ── Actions ───────────────────────────────────────────
  actions: { gap: spacing.lg },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
  },
  tos: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.xl,
  },
});
