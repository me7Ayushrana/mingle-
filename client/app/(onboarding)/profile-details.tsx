import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Input } from '@/components/ui/Input';
import { Text, Heading } from '@/components/ui/Text';
import { Routes } from '@/constants/routes';
import { profileDetailsSchema, type ProfileDetailsFormData } from '@/features/auth/validation';
import { useOnboardingStore } from '@/store/onboarding.store';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const BLUE = '#3B82F6';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const setProfileDetails = useOnboardingStore((s) => s.setProfileDetails);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileDetailsFormData>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      username: '',
      alias: '',
      language: '',
      age: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    setProfileDetails({
      username: data.username,
      alias: data.alias,
      language: data.language,
      age: data.age,
    });
    router.push(Routes.onboarding.avatarMood);
  });

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepDot} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Animated.View entering={FadeIn.duration(600)}>
              
              <Heading level={1} style={styles.title}>Your Identity</Heading>
              <Text style={styles.subtitle}>
                Set up your anonymous identity. This is what others will see.
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.form}>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Username"
                      placeholder="e.g. user_123"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.username?.message}
                    />
                    <View style={styles.fieldHint}>
                      <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.fieldHintText}>Used for login. Never shared.</Text>
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="alias"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Anonymous Alias"
                      placeholder="e.g. QuietRiver"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.alias?.message}
                    />
                    <View style={styles.fieldHint}>
                      <Ionicons name="eye" size={14} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.fieldHintText}>This is what others will see.</Text>
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="language"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Language Preference"
                    placeholder="e.g. English"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.language?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="age"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Age"
                    placeholder="e.g. 21"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.age?.message}
                  />
                )}
              />
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.footer}>
              <Pressable style={styles.submitBtn} onPress={onSubmit}>
                <LinearGradient colors={[BLUE, '#1D4ED8']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <Text style={styles.submitBtnText}>Next Step</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
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
  stepDotActive: {
    backgroundColor: BLUE,
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
    backgroundColor: 'rgba(59,130,246,0.1)',
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
    marginBottom: spacing['3xl'],
  },
  form: {
    gap: spacing.xl,
  },
  fieldHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fieldHintText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
  footer: {
    marginTop: spacing['3xl'],
    gap: spacing.lg,
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
  submitBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
