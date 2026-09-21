import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { Text, Heading } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';
import { discoveryService } from '@/services/discovery.service';
import type {
  DiscoveryProfile,
  MatchItem,
  LikeReceivedItem,
} from '@/types/discovery';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabMode = 'discover' | 'matches' | 'likes';

export default function MatchingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabMode>('discover');

  // Discovery feed state
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [ageMin, setAgeMin] = useState('18');
  const [ageMax, setAgeMax] = useState('45');
  const [selectedIntention, setSelectedIntention] = useState('all');

  // Matches & Likes state
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [likesReceived, setLikesReceived] = useState<LikeReceivedItem[]>([]);

  // It's a match modal state
  const [matchModalData, setMatchModalData] = useState<{
    visible: boolean;
    chatId: string;
    matchedUser: any;
  }>({
    visible: false,
    chatId: '',
    matchedUser: null,
  });

  // Reanimated Card Animation Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Fetch Feed
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discoveryService.getFeed({
        ageMin: Number(ageMin),
        ageMax: Number(ageMax),
        intention: selectedIntention !== 'all' ? selectedIntention : undefined,
      });
      setProfiles(data);
      setCurrentIndex(0);
      setActivePhotoIndex(0);
    } catch (err) {
      console.error('Fetch discovery feed error:', err);
    } finally {
      setLoading(false);
    }
  }, [ageMin, ageMax, selectedIntention]);

  // Fetch Matches & Likes
  const fetchMatchesAndLikes = useCallback(async () => {
    try {
      const [matchesData, likesData] = await Promise.all([
        discoveryService.getMatches(),
        discoveryService.getLikesReceived(),
      ]);
      setMatches(matchesData);
      setLikesReceived(likesData);
    } catch (err) {
      console.error('Fetch matches/likes error:', err);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    fetchMatchesAndLikes();
  }, [fetchFeed, fetchMatchesAndLikes]);

  const currentProfile = profiles[currentIndex];

  // ─── Swipe Action Handler ─────────────────────────────
  const handleSwipe = async (type: 'like' | 'pass' | 'superlike') => {
    if (!currentProfile) return;

    const targetUserId = currentProfile.userId || currentProfile.id;

    // Trigger visual slide-out animation
    const targetX = type === 'pass' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
    const targetY = type === 'superlike' ? -SCREEN_HEIGHT * 1.2 : 0;

    translateX.value = withTiming(targetX, { duration: 250 }, () => {
      runOnJS(advanceCard)();
    });
    if (type === 'superlike') {
      translateY.value = withTiming(targetY, { duration: 250 });
    }

    try {
      const res = await discoveryService.swipe({
        targetUserId,
        type,
      });

      if (res.matched && res.match) {
        setMatchModalData({
          visible: true,
          chatId: res.match.chatId,
          matchedUser: res.match.user,
        });
        fetchMatchesAndLikes();
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const advanceCard = () => {
    translateX.value = 0;
    translateY.value = 0;
    setCurrentIndex((prev) => prev + 1);
    setActivePhotoIndex(0);
    setShowDetails(false);
  };

  const handleUndo = async () => {
    try {
      await discoveryService.undo();
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setActivePhotoIndex(0);
      } else {
        fetchFeed();
      }
    } catch (err) {
      console.error('Undo error:', err);
    }
  };

  const handleMatchBack = async (item: LikeReceivedItem) => {
    try {
      const res = await discoveryService.swipe({
        targetUserId: item.user.id || item.user.userId || '',
        type: 'like',
      });
      // Remove from likes list
      setLikesReceived((prev) => prev.filter((l) => l.id !== item.id));
      if (res.matched && res.match) {
        setMatchModalData({
          visible: true,
          chatId: res.match.chatId,
          matchedUser: res.match.user,
        });
        fetchMatchesAndLikes();
      }
    } catch (err) {
      console.error('Match back error:', err);
    }
  };

  // Card animated styling
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15]
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
    };
  });

  const photosList =
    currentProfile?.photos && currentProfile.photos.length > 0
      ? currentProfile.photos
      : [
          {
            id: 'p1',
            url: `https://api.dicebear.com/7.x/bottts/png?seed=${currentProfile?.avatarId || 'user'}&size=400`,
            isPrimary: true,
            order: 0,
          },
        ];

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#050508']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Heading level={1} style={styles.brandTitle}>
            Mingle
          </Heading>

          {/* Navigation Segments */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setActiveTab('discover')}
              style={[styles.segmentBtn, activeTab === 'discover' && styles.segmentBtnActive]}
            >
              <Ionicons
                name="flame"
                size={18}
                color={activeTab === 'discover' ? colors.primary : 'rgba(255,255,255,0.4)'}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'discover' && styles.segmentTextActive,
                ]}
              >
                Discover
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveTab('matches');
                fetchMatchesAndLikes();
              }}
              style={[styles.segmentBtn, activeTab === 'matches' && styles.segmentBtnActive]}
            >
              <Ionicons
                name="heart"
                size={18}
                color={activeTab === 'matches' ? colors.primary : 'rgba(255,255,255,0.4)'}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'matches' && styles.segmentTextActive,
                ]}
              >
                Matches ({matches.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveTab('likes');
                fetchMatchesAndLikes();
              }}
              style={[styles.segmentBtn, activeTab === 'likes' && styles.segmentBtnActive]}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={activeTab === 'likes' ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === 'likes' && styles.segmentTextActive,
                ]}
              >
                Likes ({likesReceived.length})
              </Text>
            </Pressable>
          </View>

          {/* Filter button */}
          <Pressable
            onPress={() => setShowFilterModal(true)}
            style={styles.filterHeaderBtn}
          >
            <Ionicons name="options-outline" size={22} color="white" />
          </Pressable>
        </View>

        {/* ─── TAB 1: DISCOVER CARD DECK ──────────────────────── */}
        {activeTab === 'discover' && (
          <View style={styles.deckContainer}>
            {loading ? (
              <View style={styles.loadingState}>
                <Ionicons name="sparkles" size={48} color={colors.primary} />
                <Text style={styles.loadingText}>Finding awesome people nearby...</Text>
              </View>
            ) : currentProfile ? (
              <View style={styles.cardWrapper}>
                <Animated.View style={[styles.swipeCard, cardAnimatedStyle]}>
                  {/* Photo with Carousel Indicator */}
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: photosList[activePhotoIndex]?.url }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.95)']}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Carousel Tap Areas */}
                    <View style={styles.photoTapRow}>
                      <Pressable
                        style={styles.photoTapLeft}
                        onPress={() =>
                          setActivePhotoIndex((prev) => Math.max(0, prev - 1))
                        }
                      />
                      <Pressable
                        style={styles.photoTapRight}
                        onPress={() =>
                          setActivePhotoIndex((prev) =>
                            Math.min(photosList.length - 1, prev + 1)
                          )
                        }
                      />
                    </View>

                    {/* Photo Dots */}
                    {photosList.length > 1 && (
                      <View style={styles.photoDotsRow}>
                        {photosList.map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.photoDot,
                              i === activePhotoIndex && styles.photoDotActive,
                            ]}
                          />
                        ))}
                      </View>
                    )}

                    {/* Intention Pill Top Left */}
                    <View style={styles.intentionBadge}>
                      <Ionicons name="heart-circle" size={14} color="#FFF" />
                      <Text style={styles.intentionBadgeText}>
                        {currentProfile.intention?.replace('_', ' ').toUpperCase() || 'DATING'}
                      </Text>
                    </View>

                    {/* Card Content Overlay */}
                    <View style={styles.cardOverlay}>
                      <View style={styles.nameRow}>
                        <Heading level={1} style={styles.cardName}>
                          {currentProfile.name}, {currentProfile.age}
                        </Heading>
                        <Pressable
                          onPress={() => setShowDetails(!showDetails)}
                          style={styles.infoToggleBtn}
                        >
                          <Ionicons
                            name={showDetails ? 'chevron-down-circle' : 'information-circle'}
                            size={28}
                            color="white"
                          />
                        </Pressable>
                      </View>

                      {/* Location & Occupation */}
                      <View style={styles.metaRow}>
                        <Ionicons name="location-sharp" size={15} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.metaText}>
                          {currentProfile.location?.city || 'San Francisco'},{' '}
                          {currentProfile.location?.country || 'CA'}
                        </Text>
                        {currentProfile.occupation ? (
                          <>
                            <Text style={styles.metaDot}>•</Text>
                            <Text style={styles.metaText}>{currentProfile.occupation}</Text>
                          </>
                        ) : null}
                      </View>

                      {/* Bio */}
                      {currentProfile.bio ? (
                        <Text style={styles.cardBio} numberOfLines={showDetails ? undefined : 2}>
                          {currentProfile.bio}
                        </Text>
                      ) : null}

                      {/* Prompts Drawer if Expanded */}
                      {showDetails && (
                        <ScrollView style={styles.expandedDrawer} showsVerticalScrollIndicator={false}>
                          {/* Hinge-style Prompts */}
                          {currentProfile.prompts?.map((pr) => (
                            <View key={pr.id} style={styles.promptCardItem}>
                              <Text style={styles.promptItemQuestion}>{pr.question}</Text>
                              <Text style={styles.promptItemAnswer}>{pr.answer}</Text>
                            </View>
                          ))}

                          {/* Interests Chips */}
                          <View style={styles.interestsDrawerRow}>
                            {currentProfile.interests?.map((item) => (
                              <View key={item} style={styles.interestTag}>
                                <Text style={styles.interestTagText}>{item}</Text>
                              </View>
                            ))}
                          </View>

                          {/* Lifestyle Pills */}
                          {currentProfile.lifestyle && (
                            <View style={styles.lifestyleDrawerRow}>
                              {currentProfile.lifestyle.workout && (
                                <View style={styles.lifestylePill}>
                                  <Ionicons name="fitness-outline" size={13} color="white" />
                                  <Text style={styles.lifestylePillText}>
                                    {currentProfile.lifestyle.workout}
                                  </Text>
                                </View>
                              )}
                              {currentProfile.lifestyle.pets && (
                                <View style={styles.lifestylePill}>
                                  <Ionicons name="paw-outline" size={13} color="white" />
                                  <Text style={styles.lifestylePillText}>
                                    {currentProfile.lifestyle.pets}
                                  </Text>
                                </View>
                              )}
                              {currentProfile.lifestyle.drinking && (
                                <View style={styles.lifestylePill}>
                                  <Ionicons name="wine-outline" size={13} color="white" />
                                  <Text style={styles.lifestylePillText}>
                                    {currentProfile.lifestyle.drinking}
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </ScrollView>
                      )}
                    </View>
                  </View>
                </Animated.View>

                {/* ─── ACTION BUTTONS (Pass, Superlike, Like, Undo) ─────── */}
                <View style={styles.actionsBar}>
                  {/* Undo */}
                  <Pressable
                    onPress={handleUndo}
                    style={[styles.actionRoundBtn, styles.undoBtn]}
                  >
                    <Ionicons name="arrow-undo" size={20} color="#F59E0B" />
                  </Pressable>

                  {/* Pass */}
                  <Pressable
                    onPress={() => handleSwipe('pass')}
                    style={[styles.actionRoundBtn, styles.passBtn]}
                  >
                    <Ionicons name="close" size={32} color="#EF4444" />
                  </Pressable>

                  {/* Super Like */}
                  <Pressable
                    onPress={() => handleSwipe('superlike')}
                    style={[styles.actionRoundBtn, styles.superLikeBtn]}
                  >
                    <Ionicons name="star" size={24} color="#3B82F6" />
                  </Pressable>

                  {/* Like / Match */}
                  <Pressable
                    onPress={() => handleSwipe('like')}
                    style={[styles.actionRoundBtn, styles.likeBtn]}
                  >
                    <LinearGradient
                      colors={colors.primaryGradient}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Ionicons name="heart" size={32} color="white" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.emptyDeck}>
                <Ionicons name="checkmark-done-circle-outline" size={72} color="rgba(255,255,255,0.2)" />
                <Heading level={2} style={styles.emptyTitle}>
                  You&apos;ve seen everyone!
                </Heading>
                <Text style={styles.emptySubtitle}>
                  Adjust your search filters or check back soon for new Mingle members.
                </Text>
                <Button
                  title="Refresh Feed"
                  size="md"
                  onPress={fetchFeed}
                  style={{ marginTop: 20 }}
                />
              </View>
            )}
          </View>
        )}

        {/* ─── TAB 2: MATCHES LIST ────────────────────────────── */}
        {activeTab === 'matches' && (
          <View style={styles.tabContentContainer}>
            <FlatList
              data={matches}
              keyExtractor={(m) => m.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View style={styles.emptyTabState}>
                  <Ionicons name="heart-dislike-outline" size={56} color="rgba(255,255,255,0.2)" />
                  <Heading level={3} style={styles.emptyTabTitle}>
                    No Matches Yet
                  </Heading>
                  <Text style={styles.emptyTabSubtitle}>
                    Swipe right on profiles you like in Discover to find mutual matches!
                  </Text>
                  <Button
                    title="Start Discovering"
                    size="md"
                    onPress={() => setActiveTab('discover')}
                    style={{ marginTop: 16 }}
                  />
                </View>
              }
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
                  <Pressable
                    onPress={() => router.push(`/(app)/chat/${item.chatId}`)}
                    style={styles.matchCard}
                  >
                    <Avatar
                      avatarId={item.user.avatarId || 'avatar-1'}
                      alias={item.user.name}
                      size={54}
                    />
                    <View style={styles.matchInfo}>
                      <View style={styles.matchTopRow}>
                        <Text style={styles.matchName}>
                          {item.user.name}, {item.user.age}
                        </Text>
                        <Text style={styles.matchTime}>
                          {new Date(item.matchedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.matchLastMsg} numberOfLines={1}>
                        {item.lastMessage?.text || '✨ Matched! Tap to start chatting.'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                  </Pressable>
                </Animated.View>
              )}
            />
          </View>
        )}

        {/* ─── TAB 3: LIKES RECEIVED ──────────────────────────── */}
        {activeTab === 'likes' && (
          <View style={styles.tabContentContainer}>
            <FlatList
              data={likesReceived}
              keyExtractor={(l) => l.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={
                <View style={styles.emptyTabState}>
                  <Ionicons name="sparkles-outline" size={56} color="rgba(255,255,255,0.2)" />
                  <Heading level={3} style={styles.emptyTabTitle}>
                    No Pending Likes
                  </Heading>
                  <Text style={styles.emptyTabSubtitle}>
                    When someone likes your profile, they will show up here so you can match back instantly.
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
                  <View style={styles.likeCard}>
                    <Avatar
                      avatarId={item.user.avatarId || 'avatar-1'}
                      alias={item.user.name}
                      size={54}
                    />
                    <View style={styles.likeInfo}>
                      <Text style={styles.likeName}>
                        {item.user.name}, {item.user.age}
                      </Text>
                      <Text style={styles.likeBio} numberOfLines={1}>
                        {item.user.bio || 'Liked your profile on Mingle'}
                      </Text>
                      {item.comment ? (
                        <View style={styles.likeCommentBadge}>
                          <Ionicons name="chatbubble-ellipses" size={12} color={colors.primary} />
                          <Text style={styles.likeCommentText}>&ldquo;{item.comment}&rdquo;</Text>
                        </View>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => handleMatchBack(item)}
                      style={styles.matchBackBtn}
                    >
                      <LinearGradient
                        colors={colors.primaryGradient}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <Ionicons name="heart" size={16} color="white" />
                      <Text style={styles.matchBackBtnText}>Match</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              )}
            />
          </View>
        )}

        {/* ─── IT'S A MATCH CELEBRATION MODAL ────────────────── */}
        <Modal
          visible={matchModalData.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setMatchModalData({ visible: false, chatId: '', matchedUser: null })}
        >
          <BlurView intensity={90} tint="dark" style={styles.matchModalBackdrop}>
            <Animated.View entering={FadeInUp.duration(500)} style={styles.matchModalCard}>
              <Ionicons name="sparkles" size={42} color="#F59E0B" style={{ marginBottom: 12 }} />
              <Heading level={1} style={styles.matchModalTitle}>
                It&apos;s a Match! 🎉
              </Heading>
              <Text style={styles.matchModalSubtitle}>
                You and {matchModalData.matchedUser?.name || 'Someone'} liked each other!
              </Text>

              {/* Both Avatars */}
              <View style={styles.matchAvatarsRow}>
                <View style={styles.matchAvatarRing}>
                  <Avatar
                    avatarId={user?.avatarId || 'avatar-1'}
                    alias={user?.alias || 'You'}
                    size={80}
                  />
                </View>
                <View style={styles.matchHeartCenter}>
                  <LinearGradient
                    colors={colors.primaryGradient}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="heart" size={24} color="white" />
                </View>
                <View style={styles.matchAvatarRing}>
                  <Avatar
                    avatarId={matchModalData.matchedUser?.avatarId || 'avatar-2'}
                    alias={matchModalData.matchedUser?.name || 'Match'}
                    size={80}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <Button
                title="Send a Message"
                size="lg"
                onPress={() => {
                  const targetChatId = matchModalData.chatId;
                  setMatchModalData({ visible: false, chatId: '', matchedUser: null });
                  router.push(`/(app)/chat/${targetChatId}`);
                }}
                style={{ width: '100%', marginBottom: 12 }}
              />

              <Button
                title="Keep Discovering"
                size="md"
                variant="ghost"
                onPress={() =>
                  setMatchModalData({ visible: false, chatId: '', matchedUser: null })
                }
                style={{ width: '100%' }}
              />
            </Animated.View>
          </BlurView>
        </Modal>

        {/* ─── FILTERS MODAL ─────────────────────────────────── */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <BlurView intensity={70} tint="dark" style={styles.filterModalOverlay}>
            <View style={styles.filterModalSheet}>
              <View style={styles.filterHeader}>
                <Heading level={2} style={styles.filterTitle}>
                  Discovery Filters
                </Heading>
                <Pressable onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {/* Age Range */}
                <Text style={styles.filterSectionLabel}>AGE RANGE</Text>
                <View style={styles.ageInputRow}>
                  <View style={styles.ageInputWrapper}>
                    <Text style={styles.ageFieldLabel}>Min Age</Text>
                    <TextInput
                      style={styles.filterInput}
                      value={ageMin}
                      onChangeText={setAgeMin}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <Text style={styles.ageSeparator}>to</Text>
                  <View style={styles.ageInputWrapper}>
                    <Text style={styles.ageFieldLabel}>Max Age</Text>
                    <TextInput
                      style={styles.filterInput}
                      value={ageMax}
                      onChangeText={setAgeMax}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>

                {/* Intentions */}
                <Text style={[styles.filterSectionLabel, { marginTop: 20 }]}>INTENTION</Text>
                <View style={styles.intentionFilterChips}>
                  {['all', 'dating', 'long_term', 'friendship', 'casual', 'networking'].map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => setSelectedIntention(i)}
                      style={[
                        styles.filterChip,
                        selectedIntention === i && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedIntention === i && styles.filterChipTextActive,
                        ]}
                      >
                        {i.replace('_', ' ').toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Button
                title="Apply Filters"
                size="lg"
                onPress={() => {
                  setShowFilterModal(false);
                  fetchFeed();
                }}
                style={{ marginTop: 20 }}
              />
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#050508', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 520 },
  topHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  segmentText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  filterHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    justifyContent: 'center',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  swipeCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111115',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  photoTapRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  photoTapLeft: { flex: 1 },
  photoTapRight: { flex: 1 },
  photoDotsRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 6,
  },
  photoDot: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  photoDotActive: {
    backgroundColor: 'white',
  },
  intentionBadge: {
    position: 'absolute',
    top: 26,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  intentionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 26,
    fontWeight: '900',
    color: 'white',
  },
  infoToggleBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  metaDot: {
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  cardBio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginTop: 8,
  },
  expandedDrawer: {
    maxHeight: 180,
    marginTop: 10,
  },
  promptCardItem: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  promptItemQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  promptItemAnswer: {
    fontSize: 13,
    color: 'white',
    marginTop: 2,
    lineHeight: 18,
  },
  interestsDrawerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  interestTagText: {
    fontSize: 11,
    color: 'white',
  },
  lifestyleDrawerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  lifestylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lifestylePillText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.md,
  },
  actionRoundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  undoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  passBtn: {
    borderColor: 'rgba(239,68,68,0.3)',
  },
  superLikeBtn: {
    borderColor: 'rgba(59,130,246,0.3)',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderColor: 'transparent',
  },
  emptyDeck: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: 8,
  },
  emptyTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabContentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emptyTabState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTabTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
  emptyTabSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  matchInfo: {
    flex: 1,
  },
  matchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  matchTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  matchLastMsg: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },
  likeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  likeInfo: {
    flex: 1,
  },
  likeName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  likeBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  likeCommentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  likeCommentText: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
  },
  matchBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  matchBackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  matchModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  matchModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#111115',
    borderRadius: 28,
    padding: spacing['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  matchModalTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  matchModalSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  matchAvatarRing: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  matchHeartCenter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -12,
    zIndex: 10,
    overflow: 'hidden',
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalSheet: {
    backgroundColor: '#111115',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  ageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInputWrapper: {
    flex: 1,
  },
  ageFieldLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  filterInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: 16,
    padding: 12,
    textAlign: 'center',
  },
  ageSeparator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
  },
  intentionFilterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
});
