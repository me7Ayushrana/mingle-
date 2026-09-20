import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, View, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Routes } from '@/constants/routes';
import { colors } from '@/theme/colors';
import {
  firebaseAuth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from '@/config/firebase';

interface GoogleButtonProps {
  label?: string;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

export function GoogleButton({
  label = 'Continue with Google',
  onSuccess,
  onError,
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  // Check for redirect result on web return
  useEffect(() => {
    if (Platform.OS === 'web') {
      getRedirectResult(firebaseAuth)
        .then(async (result) => {
          if (result && result.user) {
            setLoading(true);
            const user = result.user;
            const idToken = await user.getIdToken();
            const response = await authService.googleAuth({
              email: user.email || undefined,
              name: user.displayName || user.email?.split('@')[0] || undefined,
              picture: user.photoURL || undefined,
              googleId: user.uid,
              token: idToken,
            });
            setUser(response.user);
            if (onSuccess) {
              onSuccess();
            } else {
              if (response.user.isOnboarded) {
                router.replace(Routes.app.home);
              } else {
                router.replace(Routes.onboarding.profileDetails);
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Firebase redirect result:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [setUser, onSuccess, router]);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (Platform.OS === 'web') {
        try {
          const result = await signInWithPopup(firebaseAuth, googleProvider);
          const user = result.user;
          const idToken = await user.getIdToken();
          const response = await authService.googleAuth({
            email: user.email || undefined,
            name: user.displayName || user.email?.split('@')[0] || undefined,
            picture: user.photoURL || undefined,
            googleId: user.uid,
            token: idToken,
          });

          setUser(response.user);
          if (onSuccess) {
            onSuccess();
          } else {
            if (response.user.isOnboarded) {
              router.replace(Routes.app.home);
            } else {
              router.replace(Routes.onboarding.profileDetails);
            }
          }
          return;
        } catch (popupErr: any) {
          console.warn('Popup error, attempting redirect fallback:', popupErr);
          if (
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/popup-closed-by-user' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            await signInWithRedirect(firebaseAuth, googleProvider);
            return;
          }
          throw popupErr;
        }
      }

      // Non-web / test prompt fallback
      const emailInput =
        typeof window !== 'undefined'
          ? window.prompt('Sign in with Google\nEnter your Google email address:', 'user@gmail.com')
          : 'user@gmail.com';
      if (emailInput && emailInput.trim()) {
        const email = emailInput.trim();
        const response = await authService.googleAuth({
          email,
          name: email.split('@')[0],
          token: `google_token_${Date.now()}`,
        });
        setUser(response.user);
        if (onSuccess) onSuccess();
        else if (response.user.isOnboarded) router.replace(Routes.app.home);
        else router.replace(Routes.onboarding.profileDetails);
      }
    } catch (err: any) {
      console.error('Firebase Google Sign-In failed:', err);
      const msg = err.response?.data?.message || err.message || 'Google Sign-In failed';
      if (onError) {
        onError(err);
      } else {
        Alert.alert('Google Sign-In', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        loading && styles.buttonDisabled,
      ]}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="logo-google" size={20} color="#EA4335" />
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.white} style={styles.loader} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    width: '100%',
  },
  buttonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.2,
  },
  loader: {
    marginLeft: 8,
  },
});
