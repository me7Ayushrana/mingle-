import { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AVATAR_OPTIONS, Avatar } from '@/components/ui/Avatar';
import { Text, Heading } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ALL_PROMPTS } from '@/constants/prompts';
import { INTENTION_OPTIONS, LIFESTYLE_OPTIONS } from '@/constants/intentions';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { musicService } from '@/services/music.service';
import MusicVibeSection from '@/components/music/MusicVibeSection';
import VoiceIntroRecorder from '@/components/music/VoiceIntroRecorder';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
];

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();
  const logout = useLogout();

  const [activeSegment, setActiveSegment] = useState<'edit' | 'preview' | 'settings'>('edit');

  // Edit fields
  const [name, setName] = useState(user?.name || user?.alias || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age || '22');
  const [city, setCity] = useState(user?.location?.city || 'San Francisco');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [education, setEducation] = useState(user?.education || '');
  const [photos, setPhotos] = useState(user?.photos || []);
  const [prompts, setPrompts] = useState(
    user?.prompts && user.prompts.length > 0
      ? user.prompts
      : [
          {
            id: 'p1',
            promptId: 'simple_pleasures',
            question: ALL_PROMPTS[0]!.question,
            answer: 'Morning pour-over coffee and curated lo-fi playlists.',
          },
          {
            id: 'p2',
            promptId: 'together_could',
            question: ALL_PROMPTS[5]!.question,
            answer: 'Try all the hidden food spots in the city.',
          },
        ]
  );
  const [selectedIntention, setSelectedIntention] = useState(user?.intention || 'dating');

  // Modal states
  const [showPromptPicker, setShowPromptPicker] = useState<number | null>(null);
  const [showPhotoAddModal, setShowPhotoAddModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Settings
  const [privacy, setPrivacy] = useState(user?.privacy || { showOnline: true, showDistance: true, incognito: false });
  const [notifications, setNotifications] = useState(user?.notificationPreferences || { matches: true, messages: true, likes: true });

  // Music & Voice state
  const router = useRouter();
  const [voiceIntro, setVoiceIntro] = useState<any>(null);
  const [musicProfile, setMusicProfile] = useState<any>(null);
  const [musicPrivacy, setMusicPrivacy] = useState<any>({
    showCurrentlyPlaying: false,
    showTopArtists: true,
    showTopTracks: true,
    showPlaylists: true,
    showMusicChemistry: true,
    showVoiceIntro: true,
    voiceIntroMatchesOnly: false,
  });

  const loadMusic = async () => {
    if (user?.id) {
      try {
        const [mp, vi] = await Promise.all([
          musicService.getMusicProfile(user.id),
          musicService.getVoiceIntro(user.id),
        ]);
        if (mp) {
          setMusicProfile(mp);
          if (mp.privacy) setMusicPrivacy(mp.privacy);
        }
        if (vi) setVoiceIntro(vi);
      } catch (err) {
        console.error('Failed to load music/voice intro:', err);
      }
    }
  };

  useEffect(() => {
    loadMusic();
  }, [user?.id]);

  // Calculate Profile Completion %
  const completionPercentage = useMemo(() => {
    let score = 20; // base registered
    if (name) score += 15;
    if (bio && bio.length > 10) score += 15;
    if (photos.length > 0) score += 20;
    if (prompts.length >= 2 && prompts[0]?.answer) score += 15;
    if (occupation || education) score += 15;
    return Math.min(100, score);
  }, [name, bio, photos, prompts, occupation, education]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile({
        name,
        alias: name,
        bio,
        age,
        location: { city, country: user.location?.country || 'United States' },
        occupation,
        education,
        photos,
        prompts,
        intention: selectedIntention as any,
        privacy,
        notificationPreferences: notifications,
      });
      setUser(updated);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      Alert.alert('Notice', 'Profile saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhoto = (url: string) => {
    if (!url.trim()) return;
    const newP = {
      id: `photo-${Date.now()}`,
      url: url.trim(),
      isPrimary: photos.length === 0,
      order: photos.length,
    };
    setPhotos((prev) => [...prev, newP]);
    setCustomPhotoUrl('');
    setShowPhotoAddModal(false);
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Permission Needed',
          'Please allow photo library access to choose pictures from your device gallery.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!;
        const photoUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        handleAddPhoto(photoUrl);
      }
    } catch (err) {
      console.error('Pick from gallery error:', err);
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access to take a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!;
        const photoUrl = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        handleAddPhoto(photoUrl);
      }
    } catch (err) {
      console.error('Take photo error:', err);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        filtered[0]!.isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryPhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === id,
      }))
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      Alert.alert('Error', 'Failed to change password. Please check your credentials.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your Mingle account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            await authService.deleteAccount();
            logout.mutate();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={['#18181B', '#050508']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Heading level={1} style={styles.headerTitle}>
            My Profile
          </Heading>
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setActiveSegment('edit')}
              style={[styles.segmentBtn, activeSegment === 'edit' && styles.segmentBtnActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeSegment === 'edit' && styles.segmentTextActive,
                ]}
              >
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveSegment('preview')}
              style={[styles.segmentBtn, activeSegment === 'preview' && styles.segmentBtnActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeSegment === 'preview' && styles.segmentTextActive,
                ]}
              >
                Preview
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveSegment('settings')}
              style={[styles.segmentBtn, activeSegment === 'settings' && styles.segmentBtnActive]}
            >
              <Ionicons
                name="settings-outline"
                size={16}
                color={activeSegment === 'settings' ? 'white' : 'rgba(255,255,255,0.4)'}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── SEGMENT 1: EDIT PROFILE ───────────────────────── */}
          {activeSegment === 'edit' && (
            <Animated.View entering={FadeIn.duration(300)}>
              {/* Profile Completion Meter */}
              <View style={styles.meterCard}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterLabel}>Profile Strength</Text>
                  <Text style={styles.meterPercent}>{completionPercentage}%</Text>
                </View>
                <View style={styles.meterTrack}>
                  <View style={[styles.meterFill, { width: `${completionPercentage}%` }]} />
                </View>
                <Text style={styles.meterTip}>
                  {completionPercentage < 100
                    ? 'Add photos and answer prompts to receive 3x more matches!'
                    : '🎉 Stellar profile! You are all set for maximum discovery.'}
                </Text>
              </View>

              {/* Photos Manager */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>PROFILE PHOTOS ({photos.length}/6)</Text>
                <Pressable
                  onPress={() => setShowPhotoAddModal(true)}
                  style={styles.addPhotoSmallBtn}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addPhotoSmallText}>Add Photo</Text>
                </Pressable>
              </View>

              <View style={styles.photosGrid}>
                {photos.map((p, idx) => (
                  <View key={p.id || idx} style={styles.photoThumbWrapper}>
                    <Image source={{ uri: p.url }} style={styles.photoThumb} />
                    {p.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>MAIN</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleDeletePhoto(p.id)}
                      style={styles.deletePhotoBtn}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </Pressable>
                    {!p.isPrimary && (
                      <Pressable
                        onPress={() => handleSetPrimaryPhoto(p.id)}
                        style={styles.makePrimaryBtn}
                      >
                        <Text style={styles.makePrimaryText}>Set Main</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
                {photos.length < 6 && (
                  <Pressable
                    onPress={() => setShowPhotoAddModal(true)}
                    style={styles.addPhotoSlot}
                  >
                    <Ionicons name="camera-outline" size={28} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.addSlotText}>Upload</Text>
                  </Pressable>
                )}
              </View>

              {/* Basic Identity Details */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>BASIC INFORMATION</Text>
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>NAME</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.fieldLabel}>AGE</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={styles.fieldLabel}>CITY</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>OCCUPATION</Text>
                <TextInput
                  style={styles.input}
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholder="e.g. Product Designer"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>EDUCATION</Text>
                <TextInput
                  style={styles.input}
                  value={education}
                  onChangeText={setEducation}
                  placeholder="e.g. Stanford University"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>ABOUT ME (BIO)</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  maxLength={300}
                  placeholder="What excites you? What kind of connections are you looking for?"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              {/* Hinge Prompts Editor */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>PROFILE PROMPTS</Text>
              {prompts.map((pr, index) => (
                <View key={pr.id || index} style={styles.promptEditCard}>
                  <Pressable
                    onPress={() =>
                      setShowPromptPicker(showPromptPicker === index ? null : index)
                    }
                    style={styles.promptPickerRow}
                  >
                    <Text style={styles.promptQuestionTitle}>{pr.question}</Text>
                    <Ionicons
                      name={showPromptPicker === index ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="white"
                    />
                  </Pressable>

                  {showPromptPicker === index && (
                    <View style={styles.promptListDropdown}>
                      {ALL_PROMPTS.slice(0, 10).map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            const updated = [...prompts];
                            updated[index] = { ...updated[index]!, question: item.question };
                            setPrompts(updated);
                            setShowPromptPicker(null);
                          }}
                          style={styles.promptDropdownOption}
                        >
                          <Text style={styles.promptDropdownText}>{item.question}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  <TextInput
                    style={styles.promptAnswerInput}
                    value={pr.answer}
                    onChangeText={(text) => {
                      const updated = [...prompts];
                      updated[index] = { ...updated[index]!, answer: text };
                      setPrompts(updated);
                    }}
                    placeholder="Type your response..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                  />
                </View>
              ))}

              {/* Intention Picker */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>LOOKING FOR</Text>
              <View style={styles.intentionsGrid}>
                {INTENTION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedIntention(opt.id)}
                    style={[
                      styles.intentionChip,
                      selectedIntention === opt.id && styles.intentionChipActive,
                    ]}
                  >
                    <Ionicons
                      name={opt.iconName as any}
                      size={16}
                      color={selectedIntention === opt.id ? colors.primary : 'rgba(255,255,255,0.5)'}
                    />
                    <Text
                      style={[
                        styles.intentionChipText,
                        selectedIntention === opt.id && styles.intentionChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Voice Intro & Music Identity */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>VOICE INTRO & VIBE</Text>
              <View style={{ marginBottom: 16 }}>
                <VoiceIntroRecorder
                  existingDuration={voiceIntro?.durationSeconds}
                  onSave={async (audioData, mimeType, durationSeconds) => {
                    const saved = await musicService.uploadVoiceIntro({
                      audioData,
                      mimeType,
                      durationSeconds,
                    });
                    setVoiceIntro(saved);
                  }}
                  onDelete={async () => {
                    await musicService.deleteVoiceIntro();
                    setVoiceIntro(null);
                  }}
                />
              </View>

              <View style={styles.musicHubBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.musicHubBannerTitle}>🎧 Music Profile</Text>
                  <Text style={styles.musicHubBannerSub}>
                    Connect Spotify, set your song of the day, create music notes & show playlists
                  </Text>
                </View>
                <Pressable
                  style={styles.openMusicHubBtn}
                  onPress={() => router.push('/(app)/music' as any)}
                >
                  <Text style={styles.openMusicHubText}>Open</Text>
                  <Ionicons name="arrow-forward" size={14} color="white" />
                </Pressable>
              </View>

              {/* Save Button */}
              <Button
                title={isSaving ? 'Saving Changes...' : 'Save Profile'}
                size="lg"
                onPress={handleSaveProfile}
                loading={isSaving}
                style={{ marginTop: 32 }}
              />
            </Animated.View>
          )}

          {/* ─── SEGMENT 2: PREVIEW PROFILE (DISCOVERY CARD PREVIEW) */}
          {activeSegment === 'preview' && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.previewHint}>
                👀 This is how other Mingle members see your profile in Discover:
              </Text>
              <View style={styles.previewCard}>
                <Image
                  source={{
                    uri:
                      photos[0]?.url ||
                      `https://api.dicebear.com/7.x/bottts/png?seed=${user.avatarId || 'user'}&size=400`,
                  }}
                  style={styles.previewImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.95)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.previewOverlay}>
                  <Heading level={1} style={styles.previewName}>
                    {name || user.alias}, {age}
                  </Heading>
                  <Text style={styles.previewMeta}>
                    📍 {city} • {occupation || 'Mingle Traveler'}
                  </Text>
                  {bio ? <Text style={styles.previewBio}>{bio}</Text> : null}

                  {/* Vibe Section Preview */}
                  <View style={{ marginTop: 12, marginBottom: 8 }}>
                    <MusicVibeSection
                      userId={user.id}
                      voiceIntro={voiceIntro}
                      currentListening={musicProfile?.currentListening || null}
                      topArtists={musicProfile?.topArtists || null}
                      isOwner={true}
                      onManageMusic={() => router.push('/(app)/music' as any)}
                    />
                  </View>

                  {prompts.map((pr) => (
                    <View key={pr.id} style={styles.previewPromptBox}>
                      <Text style={styles.previewPromptQ}>{pr.question}</Text>
                      <Text style={styles.previewPromptA}>{pr.answer}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* ─── SEGMENT 3: SETTINGS & SAFETY ───────────────────── */}
          {activeSegment === 'settings' && (
            <Animated.View entering={FadeIn.duration(300)}>
              {/* Privacy section */}
              <Text style={styles.sectionHeading}>PRIVACY & VISIBILITY</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Online Status</Text>
                    <Text style={styles.settingDesc}>Let matches see when you are active</Text>
                  </View>
                  <Pressable
                    onPress={() => setPrivacy({ ...privacy, showOnline: !privacy.showOnline })}
                    style={[styles.toggleSwitch, privacy.showOnline && styles.toggleSwitchActive]}
                  >
                    <View
                      style={[styles.toggleThumb, privacy.showOnline && styles.toggleThumbActive]}
                    />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Incognito Mode</Text>
                    <Text style={styles.settingDesc}>Only show profile to people you like</Text>
                  </View>
                  <Pressable
                    onPress={() => setPrivacy({ ...privacy, incognito: !privacy.incognito })}
                    style={[styles.toggleSwitch, privacy.incognito && styles.toggleSwitchActive]}
                  >
                    <View
                      style={[styles.toggleThumb, privacy.incognito && styles.toggleThumbActive]}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Music & Voice Privacy */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>MUSIC & VOICE PRIVACY</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Currently Playing</Text>
                    <Text style={styles.settingDesc}>Display what you are listening to</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showCurrentlyPlaying: !musicPrivacy.showCurrentlyPlaying };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showCurrentlyPlaying && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showCurrentlyPlaying && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Top Artists</Text>
                    <Text style={styles.settingDesc}>Display your favorite artists on profile</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showTopArtists: !musicPrivacy.showTopArtists };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showTopArtists && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showTopArtists && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Top Tracks</Text>
                    <Text style={styles.settingDesc}>Display your top Spotify tracks</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showTopTracks: !musicPrivacy.showTopTracks };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showTopTracks && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showTopTracks && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Playlists</Text>
                    <Text style={styles.settingDesc}>Display chosen public playlists</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showPlaylists: !musicPrivacy.showPlaylists };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showPlaylists && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showPlaylists && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Music Chemistry</Text>
                    <Text style={styles.settingDesc}>Calculate % overlap with matches</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showMusicChemistry: !musicPrivacy.showMusicChemistry };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showMusicChemistry && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showMusicChemistry && styles.toggleThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingTitle}>Show Voice Intro</Text>
                    <Text style={styles.settingDesc}>Allow people to hear your vibe</Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const updated = { ...musicPrivacy, showVoiceIntro: !musicPrivacy.showVoiceIntro };
                      setMusicPrivacy(updated);
                      await musicService.updatePrivacy(updated);
                    }}
                    style={[styles.toggleSwitch, musicPrivacy.showVoiceIntro && styles.toggleSwitchActive]}
                  >
                    <View style={[styles.toggleThumb, musicPrivacy.showVoiceIntro && styles.toggleThumbActive]} />
                  </Pressable>
                </View>
              </View>

              {/* Notification preferences */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>NOTIFICATIONS</Text>
              <View style={styles.settingsGroup}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingTitle}>New Match Alerts</Text>
                  <Pressable
                    onPress={() =>
                      setNotifications({ ...notifications, matches: !notifications.matches })
                    }
                    style={[
                      styles.toggleSwitch,
                      notifications.matches && styles.toggleSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        notifications.matches && styles.toggleThumbActive,
                      ]}
                    />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingTitle}>Likes Received Alerts</Text>
                  <Pressable
                    onPress={() =>
                      setNotifications({ ...notifications, likes: !notifications.likes })
                    }
                    style={[
                      styles.toggleSwitch,
                      notifications.likes && styles.toggleSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        notifications.likes && styles.toggleThumbActive,
                      ]}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Security & Account */}
              <Text style={[styles.sectionHeading, { marginTop: 24 }]}>ACCOUNT SECURITY</Text>
              <View style={styles.settingsGroup}>
                <Pressable
                  onPress={() => setShowPasswordModal(true)}
                  style={styles.settingRowPressable}
                >
                  <Ionicons name="key-outline" size={20} color="white" />
                  <Text style={[styles.settingTitle, { flex: 1, marginLeft: 12 }]}>
                    Change Password
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </Pressable>

                <Pressable
                  onPress={() => logout.mutate()}
                  style={styles.settingRowPressable}
                >
                  <Ionicons name="log-out-outline" size={20} color="#F59E0B" />
                  <Text style={[styles.settingTitle, { flex: 1, marginLeft: 12, color: '#F59E0B' }]}>
                    Log Out
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </Pressable>

                <Pressable
                  onPress={handleDeleteAccount}
                  style={styles.settingRowPressable}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.settingTitle, { flex: 1, marginLeft: 12, color: '#EF4444' }]}>
                    Delete Account
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </Pressable>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* ─── ADD PHOTO MODAL ──────────────────────────────── */}
        <Modal
          visible={showPhotoAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPhotoAddModal(false)}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Heading level={3} style={{ color: 'white' }}>
                  Add Profile Photo
                </Heading>
                <Pressable onPress={() => setShowPhotoAddModal(false)}>
                  <Ionicons name="close" size={22} color="white" />
                </Pressable>
              </View>

              {/* Primary Gallery & Camera Action Buttons */}
              <View style={styles.photoActionRow}>
                <Pressable
                  onPress={handlePickFromGallery}
                  style={styles.galleryPickPrimaryBtn}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Ionicons name="images" size={20} color="white" />
                  <Text style={styles.galleryPickPrimaryText}>Choose from Gallery</Text>
                </Pressable>

                <Pressable
                  onPress={handleTakePhoto}
                  style={styles.cameraPickBtn}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.cameraPickText}>Camera</Text>
                </Pressable>
              </View>

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>
                OR QUICK SELECT FROM PRESET PORTRAITS
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {SAMPLE_PHOTO_PRESETS.map((url) => (
                  <Pressable
                    key={url}
                    onPress={() => handleAddPhoto(url)}
                    style={styles.samplePhotoBtn}
                  >
                    <Image source={{ uri: url }} style={styles.samplePhotoImg} />
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>OR ENTER IMAGE URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={customPhotoUrl}
                onChangeText={setCustomPhotoUrl}
              />

              <Button
                title="Add via URL"
                size="md"
                onPress={() => handleAddPhoto(customPhotoUrl)}
                style={{ marginTop: 12 }}
              />
            </View>
          </BlurView>
        </Modal>

        {/* ─── CHANGE PASSWORD MODAL ────────────────────────── */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Heading level={3} style={{ color: 'white' }}>
                  Change Password
                </Heading>
                <Pressable onPress={() => setShowPasswordModal(false)}>
                  <Ionicons name="close" size={22} color="white" />
                </Pressable>
              </View>

              <TextInput
                style={[styles.modalInput, { marginBottom: 12 }]}
                placeholder="Current Password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="New Password (min 6 characters)"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Button
                title="Update Password"
                size="md"
                onPress={handleChangePassword}
                style={{ marginTop: 16 }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  segmentText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  meterCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  meterPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  meterTip: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  addPhotoSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoSmallText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbWrapper: {
    width: 96,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#18181B',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makePrimaryBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  makePrimaryText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
  },
  addPhotoSlot: {
    width: 96,
    height: 128,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addSlotText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: 'white',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  promptEditCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  promptPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  promptQuestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  promptListDropdown: {
    backgroundColor: '#18181B',
    borderRadius: 10,
    marginTop: 6,
    padding: 6,
  },
  promptDropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  promptDropdownText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  promptAnswerInput: {
    color: 'white',
    fontSize: 14,
    paddingTop: 8,
    minHeight: 44,
  },
  intentionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intentionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  intentionChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  intentionChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  intentionChipTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  previewHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
  },
  previewCard: {
    height: 480,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111115',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  previewName: {
    fontSize: 26,
    fontWeight: '900',
    color: 'white',
  },
  previewMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  previewBio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    lineHeight: 20,
  },
  previewPromptBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewPromptQ: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  previewPromptA: {
    fontSize: 13,
    color: 'white',
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingRowPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  settingDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#18181B',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  samplePhotoBtn: {
    width: 70,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 8,
  },
  samplePhotoImg: {
    width: '100%',
    height: '100%',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  musicHubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.18)',
    gap: 12,
    marginBottom: 8,
  },
  musicHubBannerTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  musicHubBannerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 16,
  },
  openMusicHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  openMusicHubText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  photoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  galleryPickPrimaryBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  galleryPickPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraPickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cameraPickText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
