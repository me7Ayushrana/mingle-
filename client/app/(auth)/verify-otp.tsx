import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, KeyboardAvoidingView, Platform, SafeAreaView, Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Input } from '@/components/ui/Input';
import { Text, Heading } from '@/components/ui/Text';
import { otpSchema, type OtpFormData } from '@/features/auth/validation';
import { useVerifyOtp } from '@/hooks/useAuth';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { getApiErrorMessage } from '@/api/client';


export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const verifyOtp = useVerifyOtp();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    await verifyOtp.mutateAsync({ email: email ?? '', otp: data.otp });
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
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
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
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
              </View>
              <Heading level={1} style={styles.title}>Secure Verification</Heading>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.highlight}>{email}</Text>
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.form}>
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Verification Code"
                    placeholder="000 000"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.otp?.message}
                    style={styles.input}
                  />
                )}
              />

              {verifyOtp.isError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.primary} />
                  <Text style={styles.errorText}>{getApiErrorMessage(verifyOtp.error)}</Text>
                </View>
              ) : null}

              <View style={styles.mockNoteBox}>
                <Ionicons name="code-slash" size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.mockNote}>Dev mode: Any 6 digits will work</Text>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.footer}>
              <Pressable style={styles.submitBtn} onPress={onSubmit}>
                <LinearGradient colors={colors.primaryGradient} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                {verifyOtp.isPending ? (
                  <Text style={styles.submitBtnText}>Verifying...</Text>
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Verify Code</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </Pressable>

              <Pressable style={styles.resendBtn} onPress={() => alert('Code sent!')}>
                <Text style={styles.resendText}>
                  Didn't receive code? <Text style={styles.linkText}>Resend</Text>
                </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing['3xl'],
  },
  highlight: {
    color: colors.white,
    fontWeight: '600',
  },
  form: {
    gap: spacing.xl,
  },
  input: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: '700',
    color: colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,45,85,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,45,85,0.15)',
  },
  errorText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  mockNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  mockNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  footer: {
    marginTop: spacing['3xl'],
    gap: spacing.xl,
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
  resendBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
