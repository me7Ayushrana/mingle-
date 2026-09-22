import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Linking,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Text, Heading } from '@/components/ui/Text';
import { spacing } from '@/theme/spacing';
import { useAuthStore } from '@/store/auth.store';
import { sharedPlaylistService } from '@/services/sharedPlaylist.service';
import { spotifyService } from '@/services/spotify.service';
import type { SharedPlaylist, SharedPlaylistTrack, SpotifyTrack } from '@/types/music';

export default function SharedPlaylistScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [playlist, setPlaylist] = useState<SharedPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!matchId) return;
    try {
      const pl = await sharedPlaylistService.getPlaylist(matchId);
      setPlaylist(pl);
    } catch (err) {
      console.error('SharedPlaylist load error:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await spotifyService.searchTracks(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddTrack = async (track: SpotifyTrack) => {
    if (!matchId) return;
    setAdding(true);
    try {
      const updated = await sharedPlaylistService.addTrack(matchId, {
        spotifyId: track.spotifyId,
        trackName: track.name,
        artistName: track.artistName,
        albumArt: track.albumArt,
        spotifyUrl: track.spotifyUrl,
      });
      setPlaylist(updated);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedTrack(null);
    } catch (err: any) {
      Alert.alert('Oops', err?.message || 'Failed to add track');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveTrack = (spotifyId: string) => {
    Alert.alert('Remove Track', 'Remove this song from your playlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await sharedPlaylistService.removeTrack(matchId!, spotifyId);
          setPlaylist((prev) =>
            prev ? { ...prev, tracks: prev.tracks.filter((t) => t.spotifyId !== spotifyId) } : prev
          );
        },
      },
    ]);
  };

  const handleVote = async (spotifyId: string) => {
    const result = await sharedPlaylistService.voteTrack(matchId!, spotifyId);
    setPlaylist((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: prev.tracks.map((t) => {
          if (t.spotifyId !== spotifyId) return t;
          const userId = user?.id || '';
          return {
            ...t,
            votes: result.voted
              ? [...t.votes, userId]
              : t.votes.filter((v) => v !== userId),
          };
        }),
      };
    });
  };

  const getAddedByName = (addedBy: SharedPlaylistTrack['addedBy']) => {
    if (typeof addedBy === 'string') return 'Someone';
    return (addedBy as any).alias || 'Someone';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loading}>
            <Ionicons name="musical-notes" size={40} color="rgba(255,255,255,0.15)" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const tracks = playlist?.tracks || [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Heading level={2} style={styles.headerTitle}>💞 Our Playlist</Heading>
          <Pressable style={styles.addBtn} onPress={() => setShowSearch(true)}>
            <Ionicons name="add" size={22} color="#6C63FF" />
          </Pressable>
        </Animated.View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Add songs you'd share with each other. Tap ❤️ to vote for favorites.
          </Text>
        </View>

        {/* Track list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {tracks.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={56} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyTitle}>Start your playlist</Text>
              <Text style={styles.emptyHint}>Add the first song to your shared playlist</Text>
              <Pressable style={styles.addFirstBtn} onPress={() => setShowSearch(true)}>
                <Ionicons name="add" size={18} color="white" />
                <Text style={styles.addFirstBtnText}>Add a Song</Text>
              </Pressable>
            </Animated.View>
          ) : (
            tracks.map((track, i) => {
              const hasVoted = track.votes.includes(user?.id || '');
              const isOwner = typeof track.addedBy === 'string'
                ? track.addedBy === user?.id
                : (track.addedBy as any)?._id === user?.id;
              return (
                <Animated.View
                  key={track.spotifyId + i}
                  entering={FadeInDown.duration(300).delay(i * 40)}
                  style={styles.trackCard}
                >
                  {track.albumArt ? (
                    <Image source={{ uri: track.albumArt }} style={styles.trackArt} />
                  ) : (
                    <View style={[styles.trackArt, styles.artPlaceholder]}>
                      <Ionicons name="musical-note" size={18} color="rgba(255,255,255,0.2)" />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>{track.trackName}</Text>
                    <Text style={styles.trackArtist}>{track.artistName}</Text>
                    <Text style={styles.addedBy}>Added by {getAddedByName(track.addedBy)}</Text>
                  </View>
                  <View style={styles.trackActions}>
                    {/* Vote */}
                    <Pressable style={styles.voteBtn} onPress={() => handleVote(track.spotifyId)}>
                      <Ionicons
                        name={hasVoted ? 'heart' : 'heart-outline'}
                        size={18}
                        color={hasVoted ? '#FF6B8A' : 'rgba(255,255,255,0.3)'}
                      />
                      {track.votes.length > 0 && (
                        <Text style={[styles.voteCount, hasVoted && { color: '#FF6B8A' }]}>
                          {track.votes.length}
                        </Text>
                      )}
                    </Pressable>
                    {/* Open Spotify */}
                    <Pressable onPress={() => Linking.openURL(track.spotifyUrl)}>
                      <Ionicons name="open-outline" size={16} color="#1DB954" />
                    </Pressable>
                    {/* Remove (owner only) */}
                    {isOwner && (
                      <Pressable onPress={() => handleRemoveTrack(track.spotifyId)}>
                        <Ionicons name="close" size={16} color="rgba(255,100,100,0.5)" />
                      </Pressable>
                    )}
                  </View>
                </Animated.View>
              );
            })
          )}

          {tracks.length > 0 && (
            <Pressable style={styles.addMoreBtn} onPress={() => setShowSearch(true)}>
              <Ionicons name="add-circle-outline" size={18} color="#6C63FF" />
              <Text style={styles.addMoreText}>Add another song</Text>
            </Pressable>
          )}

          <Text style={styles.attribution}>Music data provided by Spotify</Text>
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Search Modal */}
        {showSearch && (
          <View style={styles.searchModal}>
            <View style={styles.searchHeader}>
              <Pressable onPress={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); setSelectedTrack(null); }}>
                <Ionicons name="close" size={22} color="white" />
              </Pressable>
              <Text style={styles.searchTitle}>🎵 Add a Song</Text>
              <View style={{ width: 22 }} />
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search songs, artists..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searching && <Ionicons name="hourglass" size={14} color="rgba(255,255,255,0.3)" />}
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.spotifyId}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.resultRow, selectedTrack?.spotifyId === item.spotifyId && styles.resultRowSelected]}
                  onPress={() => setSelectedTrack(item)}
                >
                  {item.albumArt ? (
                    <Image source={{ uri: item.albumArt }} style={styles.resultArt} />
                  ) : (
                    <View style={[styles.resultArt, styles.artPlaceholder]}>
                      <Ionicons name="musical-note" size={14} color="rgba(255,255,255,0.2)" />
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.resultArtist}>{item.artistName}</Text>
                  </View>
                  {selectedTrack?.spotifyId === item.spotifyId && (
                    <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                searchQuery.length > 1 && !searching ? (
                  <Text style={styles.noResults}>No results</Text>
                ) : null
              }
            />

            {selectedTrack && (
              <Pressable
                style={[styles.sendBtn, adding && { opacity: 0.5 }]}
                onPress={() => handleAddTrack(selectedTrack)}
                disabled={adding}
              >
                <Text style={styles.sendBtnText}>{adding ? 'Adding...' : 'Add to Playlist'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  addBtn: { width: 40, alignItems: 'flex-end' },
  disclaimer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(108,99,255,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  disclaimerText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
  listContent: { padding: spacing.xl },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  emptyHint: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  addFirstBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  trackArt: { width: 48, height: 48, borderRadius: 8 },
  artPlaceholder: { backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  trackInfo: { flex: 1 },
  trackName: { color: 'white', fontSize: 14, fontWeight: '600' },
  trackArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  addedBy: { color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 3 },
  trackActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  voteCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  addMoreText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },
  attribution: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center' },

  // Search modal
  searchModal: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#09090B',
    paddingTop: 48,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  searchTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  searchInput: { flex: 1, color: 'white', fontSize: 15, paddingVertical: 12 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultRowSelected: { backgroundColor: 'rgba(108,99,255,0.08)' },
  resultArt: { width: 44, height: 44, borderRadius: 6 },
  resultInfo: { flex: 1 },
  resultName: { color: 'white', fontSize: 14, fontWeight: '600' },
  resultArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  noResults: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: spacing.xl },
  sendBtn: {
    backgroundColor: '#6C63FF',
    margin: spacing.xl,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
