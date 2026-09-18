import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { getRedirectPath, resolveAuthRedirect } from '@/navigation/guards';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';

export default function Index() {
  const { isLoading, isAuthenticated, isOnboarded } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const redirect = resolveAuthRedirect(isLoading, isAuthenticated, isOnboarded);
  return <Redirect href={getRedirectPath(redirect) as any} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
