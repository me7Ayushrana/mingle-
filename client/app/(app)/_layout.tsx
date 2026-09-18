import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';

import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';
import { socketService } from '@/services/socket.service';

export default function AppLayout() {
  const { isAuthenticated, isOnboarded, token, user } = useAuthStore();

  // Connect socket globally when authenticated
  useEffect(() => {
    if (isAuthenticated && token && user?.id) {
      socketService.connect(token);
      // Register user room once socket is actually connected
      socketService.onConnect(() => {
        socketService.registerUser(user.id);
      });
    }
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, user?.id]);

  if (!isAuthenticated) {
    return <Redirect href={Routes.auth.welcome} />;
  }

  if (!isOnboarded) {
    return <Redirect href={Routes.onboarding.avatarMood} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="my-moments" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="groups/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="groups/info/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="groups/requests" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="groups/invite/[code]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="feedbacks" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
