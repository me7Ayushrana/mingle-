import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AVATAR_OPTIONS, Avatar } from '@/components/ui/Avatar';
import { MoodChip } from '@/components/ui/MoodChip';
import { Text, Heading } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { MOOD_OPTIONS } from '@/constants/moods';
import { ALL_PROMPTS, PROMPT_CATEGORIES } from '@/constants/prompts';
import { useCompleteOnboarding } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/store/onboarding.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
];

export default function AvatarMoodScreen() {
  const router = useRouter();
  const store = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();

  const [activeTab, setActiveTab] = useState<'photos' | 'prompts'>('photos');

  // Prompts state
  const [prompt1Question, setPrompt1Question] = useState(
    store.prompts[0]?.question || ALL_PROMPTS[0]!.question
  );
  const [prompt1Answer, setPrompt1Answer] = useState(store.prompts[0]?.answer || '');

  const [prompt2Question, setPrompt2Question] = useState(
    store.prompts[1]?.question || ALL_PROMPTS[1]!.question
  );
  const [prompt2Answer, setPrompt2Answer] = useState(store.prompts[1]?.answer || '');

  const [showPromptPicker1, setShowPromptPicker1] = useState(false);
  const [showPromptPicker2, setShowPromptPicker2] = useState(false);

  const displayAlias = store.name || store.alias || 'You';

  const handleFinish = () => {
    const finalPrompts = [
      {
        id: 'p1',
        promptId: 'prompt_1',
        question: prompt1Question,
        answer: prompt1Answer || 'Late night lo-fi beats and good coffee.',
      },
      {
        id: 'p2',
        promptId: 'prompt_2',
        question: prompt2Question,
        answer: prompt2Answer || 'Traveling to new places and trying street food.',
      },
    ];

    completeOnboarding.mutate({
      name: store.name,
      username: store.username,
      alias: store.name || store.alias,
      avatarId: store.avatarId || 'avatar-1',
      gender: store.gender,
      pronouns: store.pronouns,
      age: store.age || '22',
      bio: store.bio,
      location: { city: store.city, country: store.country },
      education: store.education,
      occupation: store.occupation,
      languages: store.languages,
      photos: store.photos,
      prompts: finalPrompts,
      interests: store.interests,
      intention: store.intention,
      lifestyle: store.lifestyle,
      mood: store.mood || 'reflective',
    });
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={[styles.progressBar, styles.progressBarActive]} />
          </View>

          <Text style={styles.stepCounter}>5/5</Text>
        </View>

        {/* Tab switch */}
        <View style={styles.tabSwitchContainer}>
          <Pressable
            onPress={() => setActiveTab('photos')}
            style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive]}>
              Photos & Avatar
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('prompts')}
            style={[styles.tabButton, activeTab === 'prompts' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'prompts' && styles.tabButtonTextActive]}>
              Prompts & Vibe
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'photos' ? (
            <Animated.View entering={FadeIn.duration(400)}>
              <Heading level={1} style={styles.title}>
                Choose Photos & Avatar
              </Heading>
              <Text style={styles.subtitle}>
                Your photos will be showcased in the Mingle Discovery Deck.
              </Text>

              {/* Sample Photo Presets */}
              <Text style={styles.sectionLabel}>PRESET PORTRAIT PHOTOS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoCarousel}>
                {SAMPLE_PHOTO_PRESETS.map((url, index) => {
                  const isAdded = store.photos.some((p) => p.url === url);
                  return (
                    <Pressable
                      key={url}
                      onPress={() => {
                        if (isAdded) {
                          const existing = store.photos.find((p) => p.url === url);
                          if (existing) store.removePhoto(existing.id);
                        } else {
                          store.addPhoto({
                            id: `photo-${Date.now()}-${index}`,
                            url,
                            isPrimary: store.photos.length === 0,
                            order: store.photos.length,
                          });
                        }
                      }}
                      style={[styles.presetPhotoWrapper, isAdded && styles.presetPhotoSelected]}
                    >
                      <Image source={{ uri: url }} style={styles.presetPhotoImage} />
                      {isAdded && (
                        <View style={styles.photoCheckBadge}>
                          <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Avatar section */}
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                OR CHOOSE A 3D PERSONA AVATAR
              </Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.slice(0, 12).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => store.setAvatarId(item)}
                    style={[styles.avatarItem, store.avatarId === item && styles.avatarSelected]}
                  >
                    <Avatar avatarId={item} alias={displayAlias} size={54} />
                    {store.avatarId === item && (
                      <View style={styles.avatarCheck}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Next button */}
              <View style={{ marginTop: 32 }}>
                <Button
                  title="Next: Profile Prompts"
                  size="lg"
                  onPress={() => setActiveTab('prompts')}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(400)}>
              <Heading level={1} style={styles.title}>
                Personality Prompts
              </Heading>
              <Text style={styles.subtitle}>
                Give potential matches easy conversation starters.
              </Text>

              {/* PROMPT 1 */}
              <View style={styles.promptCard}>
                <Pressable
                  onPress={() => setShowPromptPicker1(!showPromptPicker1)}
                  style={styles.promptHeader}
                >
                  <Text style={styles.promptQuestion}>{prompt1Question}</Text>
                  <Ionicons
                    name={showPromptPicker1 ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </Pressable>

                {showPromptPicker1 && (
                  <View style={styles.promptPickerDropdown}>
                    {ALL_PROMPTS.slice(0, 8).map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => {
                          setPrompt1Question(p.question);
                          setShowPromptPicker1(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownItemText}>{p.question}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.promptInput}
                  placeholder="Write your answer..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  value={prompt1Answer}
                  onChangeText={setPrompt1Answer}
                  maxLength={200}
                />
              </View>

              {/* PROMPT 2 */}
              <View style={styles.promptCard}>
                <Pressable
                  onPress={() => setShowPromptPicker2(!showPromptPicker2)}
                  style={styles.promptHeader}
                >
                  <Text style={styles.promptQuestion}>{prompt2Question}</Text>
                  <Ionicons
                    name={showPromptPicker2 ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </Pressable>

                {showPromptPicker2 && (
                  <View style={styles.promptPickerDropdown}>
                    {ALL_PROMPTS.slice(8, 16).map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => {
                          setPrompt2Question(p.question);
                          setShowPromptPicker2(false);
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownItemText}>{p.question}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.promptInput}
                  placeholder="Write your answer..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  multiline
                  value={prompt2Answer}
                  onChangeText={setPrompt2Answer}
                  maxLength={200}
                />
              </View>

              {/* CURRENT MOOD */}
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>TODAY&apos;S VIBE</Text>
              <View style={styles.chipsRow}>
                {MOOD_OPTIONS.map((option) => (
                  <MoodChip
                    key={option.id}
                    mood={option}
                    selected={store.mood === option.id}
                    onPress={store.setMood}
                  />
                ))}
              </View>

              {/* FINISH BUTTON */}
              <View style={{ marginTop: 36 }}>
                <Button
                  title={completeOnboarding.isPending ? 'Entering Mingle...' : 'Complete & Start Mingling'}
                  size="lg"
                  onPress={handleFinish}
                  loading={completeOnboarding.isPending}
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 520 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    marginHorizontal: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  stepCounter: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tabButtonText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'] * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  photoCarousel: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  presetPhotoWrapper: {
    width: 100,
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  presetPhotoSelected: {
    borderColor: colors.primary,
  },
  presetPhotoImage: {
    width: '100%',
    height: '100%',
  },
  photoCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  avatarItem: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  avatarCheck: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  promptQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  promptPickerDropdown: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dropdownItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  promptInput: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
