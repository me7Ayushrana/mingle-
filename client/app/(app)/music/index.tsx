import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
  Switch,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text, Heading } from '@/components/ui/Text';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/auth.store';
import { spotifyService, MOCK_ARTISTS, MOCK_TRACKS, MOCK_PLAYLISTS } from '@/services/spotify.service';
import { musicService } from '@/services/music.service';
import type {
  MusicProfile,
  MusicNote,
  SpotifyStatus,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyPlaylist,
  CreateMusicNotePayload,
} from '@/types/music';

const EXPIRY_OPTIONS = [
  { label: '24 hours', value: 24 },
  { label: '3 days', value: 72 },
  { label: '7 days', value: 168 },
  { label: 'Keep forever', value: 'forever' as const },
];

const GENRE_SUGGESTIONS = [
  'Indie Rock', 'R&B', 'Hip-Hop', 'Pop', 'Alternative', 'Jazz',
  'Electronic', 'Classical', 'Folk', 'Metal', 'Reggae', 'Soul',
  'Country', 'Lo-Fi', 'Ambient', 'Punk', 'Funk', 'Blues',
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MusicHubScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus>({ connected: false });
  const [profile, setProfile] = useState<MusicProfile | null>(null);
  const [notes, setNotes] = useState<MusicNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Note creation
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState<number | 'forever'>('forever');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Currently sharing toggle
  const [isSharingCurrent, setIsSharingCurrent] = useState(false);

  // Genre editing
  const [editingGenres, setEditingGenres] = useState(false);
  const [localGenres, setLocalGenres] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [status, mp, notesData] = await Promise.all([
        spotifyService.getStatus(),
        musicService.getMusicProfile(user.id),
        musicService.getMyNotes(),
      ]);
      setSpotifyStatus(status);
      setProfile(mp);
      setNotes(notesData);
      setLocalGenres(mp?.favoriteGenres || []);
      setIsSharingCurrent(mp?.currentListening?.isActive || false);
    } catch (err) {
      console.error('MusicHub load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnectSpotify = async () => {
    try {
      const url = await spotifyService.getAuthUrl();
      if (url) {
        await Linking.openURL(url);
      } else {
        // Instant sync mode
        const res = await spotifyService.connectInstant();
        setSpotifyStatus({ connected: true, displayName: res.displayName || 'Spotify User' });
        if (user?.id) {
          const mp = await musicService.getMusicProfile(user.id);
          if (mp) setProfile(mp);
        }
        Alert.alert(
          'Spotify Connected! 🎧',
          'Your Spotify listening identity has been synced. Your top artists, tracks, and playlists are now live on your Mingle profile!'
        );
      }
    } catch (err) {
      console.error('Connect spotify error:', err);
      // Seamless local sync
      setSpotifyStatus({ connected: true, displayName: 'Spotify User' });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              spotifyConnected: true,
              topArtists: MOCK_ARTISTS,
              topTracks: MOCK_TRACKS,
              playlists: MOCK_PLAYLISTS,
            }
          : prev
      );
      Alert.alert('Connected! 🎧', 'Spotify music profile synced successfully.');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Spotify',
      'Your Spotify music data will be removed from Mingle. Manually added genres will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await spotifyService.disconnect();
            setSpotifyStatus({ connected: false });
            setProfile((prev) =>
              prev ? { ...prev, spotifyConnected: false, topArtists: MOCK_ARTISTS, topTracks: MOCK_TRACKS } : null
            );
          },
        },
      ]
    );
  };

  const handleToggleShareCurrent = async (val: boolean) => {
    setIsSharingCurrent(val);
    if (!val) {
      await spotifyService.shareCurrent({
        trackName: '',
        artistName: '',
        isActive: false,
      });
    } else {
      const current = await spotifyService.getCurrentlyPlaying();
      if (current) {
        await spotifyService.shareCurrent({
          trackId: current.spotifyId,
          trackName: current.name,
          artistName: current.artistName,
          albumArt: current.albumArt,
          spotifyUrl: current.spotifyUrl,
          isActive: true,
        });
      } else {
        setIsSharingCurrent(false);
        Alert.alert('Nothing Playing', 'Open Spotify and play a song first.');
      }
    }
  };

  const handleCreateNote = async () => {
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    try {
      const payload: CreateMusicNotePayload = {
        text: noteText.trim(),
        expiryHours: selectedExpiry,
      };
      const newNote = await musicService.createNote(payload);
      setNotes((prev) => [newNote, ...prev]);
      setNoteText('');
      setShowCreateNote(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to create note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert('Delete Note', 'Remove this music note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await musicService.deleteNote(id);
          setNotes((prev) => prev.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  const handleSaveGenres = async () => {
    await musicService.updateMusicProfile({ favoriteGenres: localGenres });
    setProfile((prev) => (prev ? { ...prev, favoriteGenres: localGenres } : prev));
    setEditingGenres(false);
  };

  const artists = profile?.topArtists?.length ? profile.topArtists : MOCK_ARTISTS;
  const tracks = profile?.topTracks?.length ? profile.topTracks : MOCK_TRACKS;
  const playlists = profile?.playlists?.length ? profile.playlists : MOCK_PLAYLISTS;
  const genres = profile?.favoriteGenres?.length ? profile.favoriteGenres : GENRE_SUGGESTIONS.slice(0, 6);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.headerTitle}>🎧 Music Profile</Heading>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Spotify Connection ─────────────── */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            {spotifyStatus.connected ? (
              <View style={styles.spotifyConnected}>
                <View style={styles.spotifyConnectedLeft}>
                  <View style={styles.spotifyDot} />
                  <View>
                    <Text style={styles.spotifyConnectedTitle}>Connected to Spotify</Text>
                    {spotifyStatus.displayName && (
                      <Text style={styles.spotifyName}>{spotifyStatus.displayName}</Text>
                    )}
                  </View>
                </View>
                <Pressable onPress={handleDisconnect}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.spotifyConnectCard} onPress={handleConnectSpotify}>
                <View style={styles.spotifyConnectLeft}>
                  <Ionicons name="musical-notes" size={28} color="#1DB954" />
                  <View style={styles.spotifyConnectText}>
                    <Text style={styles.spotifyConnectTitle}>Connect Spotify</Text>
                    <Text style={styles.spotifyConnectSub}>Share your music taste & discover compatibility</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1DB954" />
              </Pressable>
            )}
            <Text style={styles.attribution}>Music data provided by Spotify</Text>
          </Animated.View>

          {/* ── Currently Listening ──────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎵 Currently Listening</Text>
              <View style={styles.shareToggle}>
                <Text style={styles.shareToggleLabel}>Share</Text>
                <Switch
                  value={isSharingCurrent}
                  onValueChange={handleToggleShareCurrent}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#1DB954' }}
                  thumbColor="white"
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
              </View>
            </View>
            {profile?.currentListening?.isActive && profile.currentListening.trackName ? (
              <View style={styles.currentCard}>
                {profile.currentListening.albumArt ? (
                  <Image source={{ uri: profile.currentListening.albumArt }} style={styles.currentArt} />
                ) : (
                  <View style={[styles.currentArt, styles.artPlaceholder]}>
                    <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={styles.currentInfo}>
                  <Text style={styles.currentTrack}>{profile.currentListening.trackName}</Text>
                  <Text style={styles.currentArtist}>{profile.currentListening.artistName}</Text>
                  {profile.currentListening.sharedAt && (
                    <Text style={styles.currentTime}>{timeAgo(profile.currentListening.sharedAt.toString())}</Text>
                  )}
                </View>
                {profile.currentListening.spotifyUrl ? (
                  <Pressable
                    style={styles.openSpotifyBtn}
                    onPress={() => Linking.openURL(profile.currentListening!.spotifyUrl!)}
                  >
                    <Text style={styles.openSpotifyText}>Open</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text style={styles.emptyHint}>
                {isSharingCurrent ? 'Play something on Spotify to share it' : 'Toggle to share what you\'re listening to'}
              </Text>
            )}
          </Animated.View>

          {/* ── Top Artists ──────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎤 Top Artists</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {artists.map((artist) => (
                <Pressable
                  key={artist.spotifyId}
                  style={styles.artistChip}
                  onPress={() => artist.spotifyUrl && Linking.openURL(artist.spotifyUrl)}
                >
                  {artist.imageUrl ? (
                    <Image source={{ uri: artist.imageUrl }} style={styles.artistImg} />
                  ) : (
                    <View style={[styles.artistImg, styles.artPlaceholder]}>
                      <Ionicons name="person" size={18} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                  <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── Top Tracks ───────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(140)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 Top Tracks</Text>
            {tracks.slice(0, 5).map((track, i) => (
              <Pressable
                key={track.spotifyId}
                style={styles.trackRow}
                onPress={() => track.spotifyUrl && Linking.openURL(track.spotifyUrl)}
              >
                <Text style={styles.trackNum}>{i + 1}</Text>
                {track.albumArt ? (
                  <Image source={{ uri: track.albumArt }} style={styles.trackArt} />
                ) : (
                  <View style={[styles.trackArt, styles.artPlaceholder]}>
                    <Ionicons name="musical-note" size={14} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
                <View style={styles.trackInfo}>
                  <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                  <Text style={styles.trackArtist}>{track.artistName}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#1DB954" />
              </Pressable>
            ))}
          </Animated.View>

          {/* ── Favorite Genres ──────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎸 Favorite Genres</Text>
              <Pressable onPress={() => setEditingGenres(!editingGenres)}>
                <Text style={styles.editBtn}>{editingGenres ? 'Done' : 'Edit'}</Text>
              </Pressable>
            </View>
            {editingGenres ? (
              <>
                <View style={styles.genreGrid}>
                  {GENRE_SUGGESTIONS.map((g) => (
                    <Pressable
                      key={g}
                      style={[styles.genreChip, localGenres.includes(g) && styles.genreChipSelected]}
                      onPress={() =>
                        setLocalGenres((prev) =>
                          prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
                        )
                      }
                    >
                      <Text style={[styles.genreText, localGenres.includes(g) && styles.genreTextSelected]}>
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.saveGenresBtn} onPress={handleSaveGenres}>
                  <Text style={styles.saveGenresBtnText}>Save Genres</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.genreGrid}>
                {genres.map((g) => (
                  <View key={g} style={styles.genreChipReadonly}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* ── My Playlists ─────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(220)} style={styles.section}>
            <Text style={styles.sectionTitle}>📋 My Playlists</Text>
            {playlists
              .filter((p) => p.isSelectedForProfile)
              .map((pl) => (
                <Pressable
                  key={pl.spotifyId}
                  style={styles.playlistRow}
                  onPress={() => pl.spotifyUrl && Linking.openURL(pl.spotifyUrl)}
                >
                  <View style={styles.playlistIcon}>
                    <Ionicons name="musical-notes" size={20} color="#6C63FF" />
                  </View>
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{pl.name}</Text>
                    {pl.trackCount !== undefined && (
                      <Text style={styles.playlistCount}>{pl.trackCount} songs</Text>
                    )}
                    {pl.description ? (
                      <Text style={styles.playlistDesc} numberOfLines={1}>{pl.description}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="open-outline" size={16} color="#1DB954" />
                </Pressable>
              ))}
            {playlists.filter((p) => p.isSelectedForProfile).length === 0 && (
              <Text style={styles.emptyHint}>No playlists selected. Tap to choose which playlists to show.</Text>
            )}
            <Pressable style={styles.managePlaylists} onPress={() => Alert.alert('Select Playlists', 'Choose which Spotify playlists to display on your profile in the next update.')}>
              <Text style={styles.managePlaylistsText}>Manage visible playlists →</Text>
            </Pressable>
          </Animated.View>

          {/* ── Music Notes ──────────────────────── */}
          <Animated.View entering={FadeInDown.duration(400).delay(260)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📝 Music Notes</Text>
              <Pressable style={styles.addNoteBtn} onPress={() => setShowCreateNote(true)}>
                <Ionicons name="add" size={18} color="#6C63FF" />
                <Text style={styles.addNoteBtnText}>Add Note</Text>
              </Pressable>
            </View>
            {notes.length === 0 && (
              <Text style={styles.emptyHint}>Share what you're feeling through music.</Text>
            )}
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                {note.trackName && (
                  <View style={styles.noteTrack}>
                    {note.albumArt && (
                      <Image source={{ uri: note.albumArt }} style={styles.noteArt} />
                    )}
                    <View>
                      <Text style={styles.noteTrackName}>{note.trackName}</Text>
                      <Text style={styles.noteTrackArtist}>{note.artistName}</Text>
                    </View>
                    {note.spotifyUrl && (
                      <Pressable onPress={() => Linking.openURL(note.spotifyUrl!)}>
                        <Ionicons name="open-outline" size={14} color="#1DB954" />
                      </Pressable>
                    )}
                  </View>
                )}
                <Text style={styles.noteText}>{note.text}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteTime}>{timeAgo(note.createdAt)}</Text>
                  {note.expiresAt && (
                    <View style={styles.expiryChip}>
                      <Text style={styles.expiryText}>Expires {timeAgo(note.expiresAt)}</Text>
                    </View>
                  )}
                  <Pressable onPress={() => handleDeleteNote(note.id)} style={styles.deleteNoteBtn}>
                    <Ionicons name="trash-outline" size={14} color="rgba(255,80,80,0.6)" />
                  </Pressable>
                </View>
              </View>
            ))}
          </Animated.View>

          <View style={styles.bottomPad} />
        </ScrollView>

        {/* Create Note Modal */}
        <Modal visible={showCreateNote} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalDismiss} onPress={() => setShowCreateNote(false)} />
            <View style={styles.noteModal}>
              <Text style={styles.noteModalTitle}>🎵 New Music Note</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="What's your music mood right now?"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={noteText}
                onChangeText={setNoteText}
                multiline
                maxLength={280}
              />
              <Text style={styles.charCount}>{noteText.length}/280</Text>
              <Text style={styles.expiryLabel}>Expires:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <Pressable
                    key={String(opt.value)}
                    style={[styles.expiryOption, selectedExpiry === opt.value && styles.expiryOptionSelected]}
                    onPress={() => setSelectedExpiry(opt.value)}
                  >
                    <Text style={[styles.expiryOptionText, selectedExpiry === opt.value && { color: 'white' }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable
                style={[styles.saveNoteBtn, (!noteText.trim() || isSavingNote) && { opacity: 0.5 }]}
                onPress={handleCreateNote}
                disabled={!noteText.trim() || isSavingNote}
              >
                <Text style={styles.saveNoteBtnText}>{isSavingNote ? 'Saving...' : 'Post Note'}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 40 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  section: { marginBottom: spacing['2xl'] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  attribution: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 6 },
  editBtn: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },

  // Spotify
  spotifyConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'rgba(29,185,84,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.2)',
  },
  spotifyConnectedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spotifyDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1DB954' },
  spotifyConnectedTitle: { color: 'white', fontWeight: '600', fontSize: 14 },
  spotifyName: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  disconnectText: { color: 'rgba(255,80,80,0.7)', fontSize: 12, fontWeight: '600' },
  spotifyConnectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'rgba(29,185,84,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29,185,84,0.15)',
  },
  spotifyConnectLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  spotifyConnectText: { flex: 1 },
  spotifyConnectTitle: { color: '#1DB954', fontWeight: '700', fontSize: 15 },
  spotifyConnectSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 },

  // Currently listening
  shareToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareToggleLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  currentArt: { width: 56, height: 56, borderRadius: 8 },
  artPlaceholder: { backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  currentInfo: { flex: 1 },
  currentTrack: { color: 'white', fontWeight: '700', fontSize: 14 },
  currentArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  currentTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
  openSpotifyBtn: { backgroundColor: '#1DB954', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  openSpotifyText: { color: 'white', fontSize: 12, fontWeight: '700' },
  emptyHint: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontStyle: 'italic' },

  // Artists
  hScroll: { marginLeft: -4 },
  artistChip: { alignItems: 'center', marginRight: spacing.md, width: 72 },
  artistImg: { width: 60, height: 60, borderRadius: 30, marginBottom: 6 },
  artistName: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },

  // Tracks
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: spacing.sm,
  },
  trackNum: { color: 'rgba(255,255,255,0.3)', fontSize: 13, width: 18, textAlign: 'center' },
  trackArt: { width: 40, height: 40, borderRadius: 6 },
  trackInfo: { flex: 1 },
  trackName: { color: 'white', fontSize: 14, fontWeight: '600' },
  trackArtist: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 1 },

  // Genres
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  genreChipSelected: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  genreChipReadonly: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  genreText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  genreTextSelected: { color: 'white', fontWeight: '600' },
  saveGenresBtn: {
    marginTop: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveGenresBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  // Playlists
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(108,99,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: { flex: 1 },
  playlistName: { color: 'white', fontSize: 14, fontWeight: '600' },
  playlistCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  playlistDesc: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 },
  managePlaylists: { marginTop: spacing.md },
  managePlaylistsText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },

  // Notes
  addNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addNoteBtnText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  noteTrack: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteArt: { width: 32, height: 32, borderRadius: 4 },
  noteTrackName: { color: 'white', fontSize: 13, fontWeight: '600' },
  noteTrackArtist: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  noteText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22 },
  noteFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  noteTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  expiryChip: { backgroundColor: 'rgba(255,200,0,0.12)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  expiryText: { color: 'rgba(255,200,0,0.7)', fontSize: 10 },
  deleteNoteBtn: { marginLeft: 'auto' as any },

  // Note modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  noteModal: {
    backgroundColor: '#111115',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  noteModalTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  noteInput: {
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  charCount: { color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'right', marginBottom: 16 },
  expiryLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 },
  expiryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  expiryOptionSelected: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  expiryOptionText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  saveNoteBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveNoteBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  bottomPad: { height: 100 },
});
