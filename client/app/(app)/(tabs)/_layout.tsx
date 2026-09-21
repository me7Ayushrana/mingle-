import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme/colors';
import { notificationsService } from '@/services/notifications.service';
import { chatsService } from '@/services/chats.service';
import { useAuthStore } from '@/store/auth.store';

function TabBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <View style={styles.badgeDot} />
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  const [notifCount, setNotifCount] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const poll = async () => {
      try {
        const { unreadCount } = await notificationsService.getNotifications();
        if (mounted) setNotifCount(unreadCount);
      } catch {
        // ignore
      }
      try {
        const chats = await chatsService.getChats();
        // Count chats that have a lastMessageText (active conversations)
        const active = chats.filter((c) => c.lastMessageText && c.lastMessageText.trim().length > 0).length;
        if (mounted) setUnreadChats(active);
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 45_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050508',
          borderTopColor: colors.border,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
              {notifCount > 0 && <View style={styles.tabBadgeDot} />}
            </View>
          ),
          tabBarBadge: notifCount > 0 ? (notifCount > 9 ? '9+' : notifCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF6B8A',
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B8A',
    borderWidth: 1.5,
    borderColor: '#050508',
  },
  tabBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B8A',
    borderWidth: 1.5,
    borderColor: '#050508',
  },
});
