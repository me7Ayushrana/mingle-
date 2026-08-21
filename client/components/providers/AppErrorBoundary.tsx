import { ErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, Heading } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return (
    <View style={styles.container}>
      <Heading level={2}>Something went wrong</Heading>
      <Text variant="bodySmall" muted style={styles.message}>
        {message}
      </Text>
      <Button title="Try again" onPress={resetErrorBoundary} />
    </View>
  );
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  message: {
    textAlign: 'center',
  },
});
