import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Text, Heading } from '@/components/ui/Text';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/auth.store';
import { musicService } from '@/services/music.service';
import type { MusicProfile, MusicChemistry, MusicNote } from '@/types/music';
import { MOCK_ARTISTS, MOCK_TRACKS } from '@/services/spotify.service';

export default function UserMusicScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<MusicProfile | null>(null);
  const [chemistry, setChemistry] = useState<MusicChemistry | null>(null);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [notes, setNotes] = useState<MusicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [mp, chem, ice, ns] = await Promise.all([
        musicService.getMusicProfile(userId),
        musicService.getMusicChemistry(userId),
        musicService.getMusicIcebreakers(userId),
        musicService.getUserNotes(userId),
      ]);
      setProfile(mp);
      setChemistry(chem);
      setIcebreakers(ice);
      setNotes(ns);
    } catch (err) {
      console.error('UserMusic load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const artists = profile?.topArtists?.length ? profile.topArtists : MOCK_ARTISTS;
  const tracks = profile?.topTracks?.length ? profile.topTracks : MOCK_TRACKS;
  const playlists = (profile?.playlists || []).filter((p) => p.isSelectedForProfile);

  const handleUseIcebreaker = (text: string) => {
    setSelectedIcebreaker(text);
    Alert.alert(
      'Music Icebreaker',
      `"${text}"\n\nCopied! Go to chat and paste this to start the conversation.`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loading}>
            <Ionicons name="musical-notes" size={40} color="rgba(255,255,255,0.2)" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.loading}>
            <Ionicons name="musical-notes-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No music profile yet</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.headerTitle}>🎧 Their Music</Heading>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* ── Music Chemistry ─────────────────── */}
          {chemistry && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.chemCard}>
              <Text style={styles.chemLabel}>🎧 Music Chemistry</Text>
              <Text style={styles.chemPercent}>{chemistry.chemistryPercent}%</Text>
              <View style={styles.chemGrid}>
                <View style={styles.chemRow}>
                  <Text style={styles.chemKey}>Shared artists</Text>
                  <Text style={styles.chemVal}>{chemistry.sharedArtistsCount}</Text>
                </View>
                <View style={styles.chemRow}>
                  <Text style={styles.chemKey}>Shared tracks</Text>
                  <Text style={styles.chemVal}>{chemistry.sharedTracksCount}</Text>
                </View>
                <View style={styles.chemRow}>
                  <Text style={styles.chemKey}>Genre overlap</Text>
                  <Text style={[styles.chemVal, {
                    color: chemistry.genreOverlap === 'High' ? '#1DB954' :
                      chemistry.genreOverlap === 'Medium' ? '#F59E0B' : '#FF6B8A'
                  }]}>{chemistry.genreOverlap}</Text>
                </View>
                <View style={styles.chemRow}>
                  <Text style={styles.chemKey}>Listening patterns</Text>
                  <Text style={styles.chemVal}>{chemistry.similarListeningPatterns}</Text>
                </View>
              </View>
              {chemistry.discoveryCount > 0 && (
                <Text style={styles.chemDiscovery}>{chemistry.discoveryCount} artists to explore together</Text>
              )}
              <Text style={styles.chemDisclaimer}>A fun signal, not a prediction ✨</Text>
            </Animated.View>
          )}

          {/* ── Shared Artists ──────────────────── */}
          {chemistry && chemistry.sharedArtists.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.section}>
              <Text style={styles.sectionTitle}>You both listen to...</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {chemistry.sharedArtists.map((a) => (
                  <View key={a.spotifyId} style={styles.sharedArtistChip}>
                    {a.imageUrl ? (
                      <Image source={{ uri: a.imageUrl }} style={styles.sharedArtistImg} />
                    ) : (
                      <View style={[styles.sharedArtistImg, styles.imgPlaceholder]}>
                        <Ionicons name="musical-note" size={14} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                    <Text style={styles.sharedArtistName} numberOfLines={1}>{a.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* ── Currently Listening ─────────────── */}
          {profile.currentListening?.isActive && profile.currentListening.trackName && (
            <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.section}>
              <Text style={styles.sectionTitle}>🎵 Currently Listening</Text>
              <Pressable
                style={styles.currentCard}
                onPress={() => profile.currentListening?.spotifyUrl && Linking.openURL(profile.currentListening.spotifyUrl)}
              >
                {profile.currentListening.albumArt ? (
                  <Image source={{ uri: profile.currentListening.albumArt }} style={styles.currentArt} />
                ) : (
                  <View style={[styles.currentArt, styles.imgPlaceholder]}>
                    <Ionicons name="musical-note" size={20} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={styles.currentInfo}>
                  <Text style={styles.currentTrack}>{profile.currentListening.trackName}</Text>
                  <Text style={styles.currentArtist}>{profile.currentListening.artistName}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#1DB954" />
              </Pressable>
            </Animated.View>
          )}

          {/* ── Song of the Day ─────────────────── */}
          {profile.songOfTheDay && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
              <Text style={styles.sectionTitle}>🌟 Song of the Day</Text>
              <Pressable
                style={styles.sotdCard}
                onPress={() => profile.songOfTheDay?.spotifyUrl && Linking.openURL(profile.songOfTheDay.spotifyUrl)}
              >
                {profile.songOfTheDay.albumArt && (
                  <Image source={{ uri: profile.songOfTheDay.albumArt }} style={styles.sotdArt} />
                )}
                <View style={styles.sotdInfo}>
                  <Text style={styles.sotdTrack}>{profile.songOfTheDay.trackName}</Text>
                  <Text style={styles.sotdArtist}>{profile.songOfTheDay.artistName}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#1DB954" />
              </Pressable>
            </Animated.View>
          )}

          {/* ── Top Artists ─────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(120)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎤 Top Artists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {artists.slice(0, 6).map((a) => (
                <Pressable key={a.spotifyId} style={styles.artistChip} onPress={() => a.spotifyUrl && Linking.openURL(a.spotifyUrl)}>
                  {a.imageUrl ? (
                    <Image source={{ uri: a.imageUrl }} style={styles.artistImg} />
                  ) : (
                    <View style={[styles.artistImg, styles.imgPlaceholder]}>
                      <Ionicons name="person" size={16} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                  <Text style={styles.artistName} numberOfLines={1}>{a.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── Top Tracks ──────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(140)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 Top Tracks</Text>
            {tracks.slice(0, 4).map((t) => (
              <Pressable key={t.spotifyId} style={styles.trackRow} onPress={() => t.spotifyUrl && Linking.openURL(t.spotifyUrl)}>
                {t.albumArt ? (
                  <Image source={{ uri: t.albumArt }} style={styles.trackArt} />
                ) : (
                  <View style={[styles.trackArt, styles.imgPlaceholder]}>
                    <Ionicons name="musical-note" size={14} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={styles.trackInfo}>
                  <Text style={styles.trackName} numberOfLines={1}>{t.name}</Text>
                  <Text style={styles.trackArtist}>{t.artistName}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color="#1DB954" />
              </Pressable>
            ))}
          </Animated.View>

          {/* ── Playlists ───────────────────────── */}
          {playlists.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Their Playlists</Text>
              {playlists.map((pl) => (
                <Pressable key={pl.spotifyId} style={styles.playlistRow} onPress={() => pl.spotifyUrl && Linking.openURL(pl.spotifyUrl)}>
                  <View style={styles.playlistIcon}>
                    <Ionicons name="musical-notes" size={18} color="#6C63FF" />
                  </View>
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{pl.name}</Text>
                    {pl.trackCount !== undefined && <Text style={styles.playlistCount}>{pl.trackCount} songs</Text>}
                  </View>
                  <Ionicons name="open-outline" size={14} color="#1DB954" />
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* ── Music Notes ─────────────────────── */}
          {notes.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Music Notes</Text>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  {note.trackName && (
                    <Text style={styles.noteTrack}>🎵 {note.trackName} — {note.artistName}</Text>
                  )}
                  <Text style={styles.noteText}>{note.text}</Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* ── Icebreakers ─────────────────────── */}
          {icebreakers.length > 0 && (
            <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>💬 Conversation Starters</Text>
              <Text style={styles.icebreakerHint}>Tap one to use it as your opener.</Text>
              {icebreakers.map((text, i) => (
                <Pressable key={i} style={styles.icebreakerCard} onPress={() => handleUseIcebreaker(text)}>
                  <Ionicons name="musical-note" size={16} color="#6C63FF" style={{ marginRight: 8 }} />
                  <Text style={styles.icebreakerText}>{text}</Text>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* Spotify attribution */}
          <Text style={styles.attribution}>Music data provided by Spotify</Text>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  backBtn: { padding: spacing.sm, width: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.xl },
  section: { marginBottom: spacing['2xl'] },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  attribution: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginBottom: spacing.lg },

  // Chemistry
  chemCard: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.15)',
    alignItems: 'center',
  },
  chemLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 },
  chemPercent: { fontSize: 56, fontWeight: '800', color: '#6C63FF', lineHeight: 64 },
  chemGrid: { width: '100%', marginTop: spacing.md, gap: 8 },
  chemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chemKey: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  chemVal: { color: 'white', fontSize: 13, fontWeight: '600' },
  chemDiscovery: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 12 },
  chemDisclaimer: { color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 4 },

  // Shared artists
  sharedArtistChip: { alignItems: 'center', marginRight: spacing.md, width: 60 },
  sharedArtistImg: { width: 48, height: 48, borderRadius: 24, marginBottom: 4 },
  sharedArtistName: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center' },
  imgPlaceholder: { backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },

  // Current listening
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(29,185,84,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.12)',
  },
  currentArt: { width: 48, height: 48, borderRadius: 8 },
  currentInfo: { flex: 1 },
  currentTrack: { color: 'white', fontWeight: '700', fontSize: 14 },
  currentArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  // SOTD
  sotdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(245,158,11,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
  },
  sotdArt: { width: 48, height: 48, borderRadius: 8 },
  sotdInfo: { flex: 1 },
  sotdTrack: { color: 'white', fontWeight: '700', fontSize: 14 },
  sotdArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  // Artists
  artistChip: { alignItems: 'center', marginRight: spacing.md, width: 64 },
  artistImg: { width: 52, height: 52, borderRadius: 26, marginBottom: 4 },
  artistName: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center' },

  // Tracks
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  trackArt: { width: 38, height: 38, borderRadius: 6 },
  trackInfo: { flex: 1 },
  trackName: { color: 'white', fontSize: 13, fontWeight: '600' },
  trackArtist: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },

  // Playlists
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  playlistIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(108,99,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: { flex: 1 },
  playlistName: { color: 'white', fontSize: 13, fontWeight: '600' },
  playlistCount: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },

  // Notes
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: 8,
  },
  noteTrack: { color: '#1DB954', fontSize: 12, marginBottom: 4 },
  noteText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 },

  // Icebreakers
  icebreakerHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: spacing.md },
  icebreakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: 'rgba(108,99,255,0.1)',
    borderLeftColor: '#6C63FF',
    gap: 4,
  },
  icebreakerText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 18 },
});
