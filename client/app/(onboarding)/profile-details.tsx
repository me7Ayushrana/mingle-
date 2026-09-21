import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Text, Heading } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Routes } from '@/constants/routes';
import { INTENTION_OPTIONS, LIFESTYLE_OPTIONS } from '@/constants/intentions';
import { INTEREST_CATEGORIES } from '@/constants/interests';
import { useOnboardingStore } from '@/store/onboarding.store';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Open to all'];

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const onboardingStore = useOnboardingStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState(onboardingStore.name || '');
  const [username, setUsername] = useState(onboardingStore.username || '');
  const [age, setAge] = useState(onboardingStore.age || '22');
  const [gender, setGender] = useState(onboardingStore.gender || 'Woman');
  const [pronouns, setPronouns] = useState(onboardingStore.pronouns || '');

  const [city, setCity] = useState(onboardingStore.city || 'San Francisco');
  const [occupation, setOccupation] = useState(onboardingStore.occupation || '');
  const [education, setEducation] = useState(onboardingStore.education || '');
  const [bio, setBio] = useState(onboardingStore.bio || '');

  const [selectedIntention, setSelectedIntention] = useState(onboardingStore.intention || 'dating');
  const [lifestyle, setLifestyleState] = useState(onboardingStore.lifestyle);

  const selectedInterests = onboardingStore.interests;

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) return;
      onboardingStore.setBasics({
        name: name.trim(),
        username: username.trim() || name.toLowerCase().replace(/[^a-z0-9_]/g, '') + Math.floor(100 + Math.random() * 900),
        alias: name.trim(),
        gender,
        pronouns,
        age: age.trim() || '22',
      });
      setStep(2);
    } else if (step === 2) {
      onboardingStore.setDetails({
        city: city.trim(),
        occupation: occupation.trim(),
        education: education.trim(),
        bio: bio.trim(),
      });
      setStep(3);
    } else if (step === 3) {
      onboardingStore.setIntention(selectedIntention);
      onboardingStore.setLifestyle(lifestyle);
      setStep(4);
    } else if (step === 4) {
      router.push(Routes.onboarding.avatarMood);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as any);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#000000']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          {/* Header & Progress */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>

            <View style={styles.progressContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressBar,
                    i <= step && styles.progressBarActive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.stepCounter}>{step}/5</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <Animated.View entering={FadeIn.duration(400)}>
                <Heading level={1} style={styles.title}>
                  What&apos;s your name?
                </Heading>
                <Text style={styles.subtitle}>
                  Let others on Mingle get to know the authentic you.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FIRST NAME *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. alex_vibe"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>AGE *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 24"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      maxLength={2}
                      value={age}
                      onChangeText={setAge}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1.5 }]}>
                    <Text style={styles.label}>PRONOUNS</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. she/her, they/them"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={pronouns}
                      onChangeText={setPronouns}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>I IDENTIFY AS</Text>
                  <View style={styles.chipsRow}>
                    {GENDER_OPTIONS.map((g) => (
                      <Pressable
                        key={g}
                        onPress={() => setGender(g)}
                        style={[styles.chip, gender === g && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
                          {g}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* STEP 2: ABOUT & LOCATION */}
            {step === 2 && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <Heading level={1} style={styles.title}>
                  Where are you based?
                </Heading>
                <Text style={styles.subtitle}>
                  Share a bit about your city, lifestyle, and work.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CITY / LOCATION *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. San Francisco, CA"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>OCCUPATION / JOB</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Product Designer, Software Engineer"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={occupation}
                    onChangeText={setOccupation}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EDUCATION / COLLEGE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Stanford University"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={education}
                    onChangeText={setEducation}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>SHORT BIO</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell your story, your quirks, and what makes you happy..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    value={bio}
                    onChangeText={setBio}
                  />
                  <Text style={styles.charCount}>{bio.length}/300</Text>
                </View>
              </Animated.View>
            )}

            {/* STEP 3: INTENTION & LIFESTYLE */}
            {step === 3 && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <Heading level={1} style={styles.title}>
                  What are you looking for?
                </Heading>
                <Text style={styles.subtitle}>
                  Mingle connects people for dating, friendship, and networking.
                </Text>

                <View style={styles.intentionsList}>
                  {INTENTION_OPTIONS.map((opt) => {
                    const isSelected = selectedIntention === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => setSelectedIntention(opt.id)}
                        style={[styles.intentionCard, isSelected && styles.intentionCardActive]}
                      >
                        <View style={styles.intentionIconWrapper}>
                          <Ionicons
                            name={opt.iconName as any}
                            size={24}
                            color={isSelected ? colors.primary : 'rgba(255,255,255,0.6)'}
                          />
                        </View>
                        <View style={styles.intentionTextWrapper}>
                          <Text style={[styles.intentionTitle, isSelected && styles.intentionTitleActive]}>
                            {opt.label}
                          </Text>
                          <Text style={styles.intentionDesc}>{opt.description}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Heading level={3} style={[styles.sectionHeading, { marginTop: 24 }]}>
                  Lifestyle & Habits
                </Heading>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DRINKING</Text>
                  <View style={styles.chipsRow}>
                    {LIFESTYLE_OPTIONS.drinking.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setLifestyleState({ ...lifestyle, drinking: item })}
                        style={[styles.chip, lifestyle.drinking === item && styles.chipActive]}
                      >
                        <Text
                          style={[styles.chipText, lifestyle.drinking === item && styles.chipTextActive]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PETS</Text>
                  <View style={styles.chipsRow}>
                    {LIFESTYLE_OPTIONS.pets.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => setLifestyleState({ ...lifestyle, pets: item })}
                        style={[styles.chip, lifestyle.pets === item && styles.chipActive]}
                      >
                        <Text
                          style={[styles.chipText, lifestyle.pets === item && styles.chipTextActive]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* STEP 4: INTERESTS */}
            {step === 4 && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <Heading level={1} style={styles.title}>
                  Your Passions & Interests
                </Heading>
                <Text style={styles.subtitle}>
                  Select 3 to 8 topics you love talking about.
                </Text>

                <View style={styles.interestCounterRow}>
                  <Text style={styles.interestCountText}>
                    Selected: {selectedInterests.length}/8
                  </Text>
                </View>

                {INTEREST_CATEGORIES.map((cat) => (
                  <View key={cat.category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{cat.category.toUpperCase()}</Text>
                    <View style={styles.chipsRow}>
                      {cat.items.map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <Pressable
                            key={item}
                            onPress={() => onboardingStore.toggleInterest(item)}
                            style={[styles.interestChip, isSelected && styles.interestChipActive]}
                          >
                            <Text
                              style={[
                                styles.interestChipText,
                                isSelected && styles.interestChipTextActive,
                              ]}
                            >
                              {item}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Next Button */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.footer}>
              <Button
                title={step === 4 ? 'Continue to Photos & Prompts' : 'Continue'}
                size="lg"
                onPress={handleNext}
                disabled={step === 1 && !name.trim()}
                style={styles.nextButton}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 520 },
  flex: { flex: 1 },
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
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  intentionsList: {
    gap: 12,
  },
  intentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  intentionCardActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: colors.primary,
  },
  intentionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  intentionTextWrapper: {
    flex: 1,
  },
  intentionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  intentionTitleActive: {
    color: 'white',
  },
  intentionDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  interestCounterRow: {
    marginBottom: 16,
  },
  interestCountText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  interestChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  interestChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  footer: {
    marginTop: spacing.xl,
  },
  nextButton: {
    width: '100%',
  },
});
