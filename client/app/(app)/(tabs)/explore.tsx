import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Switch,
  TextInput,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
  SlideOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { MoodChip } from '@/components/ui/MoodChip';
import { Button } from '@/components/ui/Button';
import { PulseDot } from '@/components/ui/PulseDot';
import { MOOD_OPTIONS, MoodType } from '@/constants/moods';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { usersService, ActiveUser } from '@/services/users.service';
import { socketService } from '@/services/socket.service';

const { height } = Dimensions.get('window');

export default function ExploreScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  // States
  const [isActive, setIsActive] = useState(false);
  const [showActiveSetup, setShowActiveSetup] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  // Setup forms
  const [myMood, setMyMood] = useState<MoodType | null>(null);
  const [myVibe, setMyVibe] = useState('');

  // Real data
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchActiveUsers = async () => {
    try {
      const users = await usersService.getActiveUsers();
      setActiveUsers(users);
    } catch (err) {
      console.error('Failed to fetch active users', err);
    }
  };

  useEffect(() => {
    fetchActiveUsers();

    const unsubUpdate = socketService.onActiveUsersUpdated(() => {
      fetchActiveUsers();
    });

    const unsubReq = socketService.onReceiveConnectRequest((req) => {
      setRequests((prev) => [req, ...prev]);
      setShowRequests(true);
    });

    const unsubAccept = socketService.onConnectRequestAccepted(({ chatId }) => {
      router.push(`/(app)/chat/${chatId}`);
    });

    const unsubError = socketService.onConnectRequestError(({ requestId, message }) => {
      Alert.alert('Connection Failed', message);
      if (requestId) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    });

    return () => {
      unsubUpdate();
      unsubReq();
      unsubAccept();
      unsubError();
    };
  }, [router]);

  const handleToggleActive = (val: boolean) => {
    if (val) {
      setShowActiveSetup(true);
    } else {
      setIsActive(false);
      socketService.toggleActive(user!.id, '', '', false);
    }
  };

  const handleMakeActive = () => {
    if (myMood && myVibe) {
      setIsActive(true);
      setShowActiveSetup(false);
      socketService.toggleActive(user!.id, myMood, myVibe, true);
    } else {
      alert('Please select a mood and enter a vibe.');
    }
  };

  const renderActiveDashboard = () => {
    if (!isActive || !myMood) return null;
    const mood = (MOOD_OPTIONS.find((m) => m.id === myMood) || MOOD_OPTIONS[0])!;

    return (
      <Animated.View entering={FadeInDown.duration(600)} style={styles.dashboardCard}>
        <LinearGradient
          colors={['rgba(255, 45, 85, 0.12)', 'rgba(255, 45, 85, 0.03)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.dashboardInner}>
          <View style={styles.cardTopRow}>
            <Avatar avatarId={user?.avatarId || 'avatar-1'} alias={user?.alias} size={44} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Heading level={3} style={styles.alias}>
                {user?.alias || 'Me'}
              </Heading>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <PulseDot color={colors.primary} />
                <Text style={styles.dashStatusText}>Active & Visible ({mood.emoji})</Text>
              </View>
            </View>
          </View>

          <Text style={styles.vibeText}>&quot;{myVibe}&quot;</Text>

          <Pressable onPress={() => setShowRequests(true)} style={styles.dashRequestsBtn}>
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dashRequestsGradient}
            >
              <Text style={styles.dashRequestsText}>View Requests</Text>
              {requests.length > 0 && (
                <View style={styles.dashRequestsBadge}>
                  <Text style={styles.dashRequestsBadgeText}>{requests.length}</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderVoiceCircles = () => (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <Heading level={3} style={{ fontSize: 16, color: '#FFF' }}>
          🎙️ Mingle Circles (Live Voice)
        </Heading>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Live Rooms</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {[
          { title: 'Late Night Venting', topic: 'Open mic for feelings', mood: 'lonely', count: 8 },
          { title: 'Anxiety Grounding', topic: 'Soft lofi & gentle chat', mood: 'anxious', count: 12 },
          { title: 'Good News Only', topic: 'Share small wins today', mood: 'hopeful', count: 15 },
        ].map((circle) => (
          <View key={circle.title} style={{ width: 160, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' }} />
              <Text style={{ color: '#34C759', fontSize: 10, fontWeight: '700' }}>{circle.count} listening</Text>
            </View>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{circle.title}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }} numberOfLines={2}>{circle.topic}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderProfileCard = ({ item, index }: { item: ActiveUser; index: number }) => (
    <ProfileCard key={item._id} item={item} index={index} myUserId={user!.id} />
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.headerTop}>
            <Heading level={1} style={styles.title}>
              Explore
            </Heading>

            <View style={styles.headerRight}>
              {/* Active Toggle */}
              <View style={styles.activeToggleContainer}>
                <Text style={styles.activeToggleLabel}>Active</Text>
                <Switch
                  value={isActive}
                  onValueChange={handleToggleActive}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary }}
                  thumbColor={'white'}
                  ios_backgroundColor="rgba(255,255,255,0.2)"
                  style={{ transform: [{ scale: 0.75 }] }}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Feed */}
        <FlatList
          data={activeUsers}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={
            <View>
              {renderActiveDashboard()}
              {renderVoiceCircles()}
            </View>
          }
          renderItem={renderProfileCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
                No active users right now.
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* Setup Active Modal */}
      {showActiveSetup && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          style={styles.overlayWrapper}
        >
          <BlurView intensity={80} tint="dark" style={styles.overlay}>
            <Pressable style={styles.overlayClose} onPress={() => setShowActiveSetup(false)} />
            <View style={styles.sheetContent}>
              <View style={styles.sheetHandle} />
              <Heading level={2} style={styles.sheetTitle}>
                Go Active
              </Heading>
              <Text style={styles.sheetSubtitle}>
                Let others know what vibe you&apos;re bringing.
              </Text>

              <Text style={styles.inputLabel}>SELECT YOUR MOOD</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => (
                  <MoodChip
                    key={mood.id}
                    mood={mood}
                    selected={myMood === mood.id}
                    onPress={(id) => setMyMood(id as MoodType)}
                  />
                ))}
              </View>

              <Text style={styles.inputLabel}>YOUR VIBE</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What are you looking for right now?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={myVibe}
                onChangeText={setMyVibe}
                maxLength={60}
              />

              <Button
                title="Make me Active"
                size="lg"
                onPress={handleMakeActive}
                style={{ width: '100%', marginTop: spacing.md }}
              />
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Requests Modal */}
      {showRequests && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          style={styles.overlayWrapper}
        >
          <BlurView intensity={80} tint="dark" style={styles.overlay}>
            <Pressable style={styles.overlayClose} onPress={() => setShowRequests(false)} />
            <View style={[styles.sheetContent, { maxHeight: height * 0.85 }]}>
              <View style={styles.sheetHandle} />
              <Heading level={2} style={styles.sheetTitle}>
                Requests
              </Heading>
              <Text style={styles.sheetSubtitle}>People who want to connect with you</Text>

              <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing['4xl'] }}
                ListEmptyComponent={
                  <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    No requests right now.
                  </Text>
                }
                renderItem={({ item }) => (
                  <RequestCard
                    item={item}
                    onAccept={() => {
                      socketService.acceptConnectRequest(item.id);
                      setRequests((prev) => prev.filter((r) => r.id !== item.id));
                    }}
                    onDecline={() => {
                      socketService.declineConnectRequest(item.id);
                      setRequests((prev) => prev.filter((r) => r.id !== item.id));
                    }}
                  />
                )}
              />
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const RequestCard = ({
  item,
  onAccept,
  onDecline,
}: {
  item: any;
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const mood = (MOOD_OPTIONS.find((m) => m.id === item.moodId) || MOOD_OPTIONS[0])!;
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    let timer: any;
    // Calculate remaining time based on expiresAt
    const updateTime = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(item.expiresAt).getTime() - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining === 0) onDecline();
    };

    updateTime();
    timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [item.expiresAt, onDecline]);

  return (
    <View style={styles.requestCard}>
      {/* 15s Progress bar */}
      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, { width: `${(timeLeft / 15) * 100}%` }]} />
      </View>

      <View style={[styles.requestTopRow, { marginTop: 8 }]}>
        <Avatar avatarId={item.avatarId} alias={item.alias} size={40} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Heading level={3} style={{ fontSize: 16, color: 'white' }}>
            {item.alias}
          </Heading>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {mood.label} {mood.emoji}
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <Pressable onPress={onDecline} style={styles.reqBtnDecline}>
          <Text style={styles.reqBtnDeclineText}>Decline</Text>
        </Pressable>
        <Pressable onPress={onAccept} style={styles.reqBtnAccept}>
          <Text style={styles.reqBtnAcceptText}>Accept ({timeLeft}s)</Text>
        </Pressable>
      </View>
    </View>
  );
};

const ProfileCard = ({
  item,
  index,
  myUserId,
}: {
  item: ActiveUser;
  index: number;
  myUserId: string;
}) => {
  const mood = (MOOD_OPTIONS.find((m) => m.id === item.moodId) || MOOD_OPTIONS[0])!;
  const [requested, setRequested] = useState(false);

  const handleConnect = () => {
    socketService.sendConnectRequest(myUserId, item.userId._id);
    setRequested(true);
    setTimeout(() => setRequested(false), 15000); // Reset button after 15s timeout
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(index * 50)}
      layout={LinearTransition.springify()}
      style={styles.card}
    >
      <View style={styles.cardTopRow}>
        <Avatar avatarId={item.userId.avatarId} alias={item.userId.alias} size={44} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Heading level={3} style={styles.alias}>
            {item.userId.alias}
          </Heading>
          <Text style={styles.cardMoodLabel}>
            {mood.label} {mood.emoji}
          </Text>
        </View>
      </View>

      <Text style={styles.vibeText}>&quot;{item.vibe}&quot;</Text>

      <View style={styles.cardActions}>
        <Pressable
          onPress={handleConnect}
          style={[styles.connectBtn, requested && styles.connectingBtn]}
          disabled={requested}
        >
          <Text style={styles.connectBtnText}>{requested ? 'Request Sent' : 'Connect'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  activeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeToggleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 120,
    gap: spacing.lg,
  },

  // Active Dashboard Layout
  dashboardCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.3)',
    marginBottom: spacing.md,
  },
  dashboardInner: {
    padding: spacing.lg,
  },
  dashStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dashRequestsBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dashRequestsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.sm,
  },
  dashRequestsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  dashRequestsBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  dashRequestsBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  // Standard Profile Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alias: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  cardMoodLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  vibeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  skipBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  connectBtn: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectingBtn: {
    backgroundColor: 'rgba(255, 45, 85, 0.4)',
  },
  connectBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  // Overlays
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayClose: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: spacing.lg,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.xl,
  },

  // Request Cards
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requestMsg: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reqBtnDecline: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  reqBtnDeclineText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  reqBtnAccept: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  reqBtnAcceptText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
