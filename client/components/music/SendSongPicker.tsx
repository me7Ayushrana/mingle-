import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { spotifyService } from '@/services/spotify.service';
import type { SpotifyTrack } from '@/types/music';
import SongCard from './SongCard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SelectedTrack {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
}

interface SendSongPickerProps {
  visible: boolean;
  onClose: () => void;
  onSend: (track: SelectedTrack, message: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SendSongPicker({ visible, onClose, onSend }: SendSongPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SelectedTrack | null>(null);
  const [message, setMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageInputRef = useRef<TextInput>(null);

  // Reset on open/close
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setSelectedTrack(null);
      setMessage('');
      setIsSearching(false);
    }
  }, [visible]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const tracks = await spotifyService.searchTracks(query.trim());
        setResults(tracks);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectTrack = useCallback((track: SpotifyTrack) => {
    setSelectedTrack({
      spotifyId: track.spotifyId,
      trackName: track.name,
      artistName: track.artistName,
      albumArt: track.albumArt,
      spotifyUrl: track.spotifyUrl,
    });
    // Focus message input after selection
    setTimeout(() => messageInputRef.current?.focus(), 100);
  }, []);

  const handleSend = useCallback(() => {
    if (!selectedTrack) return;
    onSend(selectedTrack, message.trim());
  }, [selectedTrack, message, onSend]);

  const handleBack = useCallback(() => {
    setSelectedTrack(null);
    setMessage('');
  }, []);

  const renderTrack = useCallback(
    ({ item }: { item: SpotifyTrack }) => (
      <SongCard
        track={item}
        onPress={() => handleSelectTrack(item)}
        showSpotifyLink={false}
        compact={false}
        selected={selectedTrack?.spotifyId === item.spotifyId}
      />
    ),
    [handleSelectTrack, selectedTrack],
  );

  const keyExtractor = useCallback((item: SpotifyTrack) => item.spotifyId, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎵 Send a Song</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* ── Selected track + message view ── */}
          {selectedTrack ? (
            <View style={styles.selectedView}>
              {/* Back */}
              <Pressable style={styles.backRow} onPress={handleBack}>
                <Ionicons name="chevron-back" size={16} color="#6C63FF" />
                <Text style={styles.backText}>Back to search</Text>
              </Pressable>

              {/* Selected track card */}
              <SongCard
                track={{
                  spotifyId: selectedTrack.spotifyId,
                  name: selectedTrack.trackName,
                  artistName: selectedTrack.artistName,
                  albumArt: selectedTrack.albumArt,
                  spotifyUrl: selectedTrack.spotifyUrl,
                }}
                showSpotifyLink={false}
                selected
              />

              {/* Message input */}
              <TextInput
                ref={messageInputRef}
                style={styles.messageInput}
                placeholder="Add a message…"
                placeholderTextColor="#52525B"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={200}
              />

              {/* Send button */}
              <Pressable
                style={[styles.sendButton, !selectedTrack && styles.sendButtonDisabled]}
                onPress={handleSend}
                accessibilityRole="button"
                accessibilityLabel="Send song"
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.sendText}>Send Song</Text>
              </Pressable>
            </View>
          ) : (
            /* ── Search view ── */
            <View style={styles.searchView}>
              {/* Search bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="#52525B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Spotify tracks…"
                  placeholderTextColor="#52525B"
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable
                    onPress={() => setQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color="#52525B" />
                  </Pressable>
                )}
              </View>

              {/* Results */}
              {isSearching ? (
                <View style={styles.center}>
                  <ActivityIndicator color="#6C63FF" />
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  renderItem={renderTrack}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={styles.list}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
              ) : query.trim().length > 0 ? (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>No tracks found for "{query}"</Text>
                </View>
              ) : (
                <View style={styles.center}>
                  <Ionicons name="musical-notes-outline" size={32} color="#3F3F46" />
                  <Text style={styles.emptyText}>Search for a track to send</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#12121A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FAFAFA',
    paddingVertical: 0,
  },
  list: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#52525B',
    textAlign: 'center',
  },
  selectedView: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  messageInput: {
    backgroundColor: '#1A1A26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    fontSize: 15,
    color: '#FAFAFA',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    height: 50,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
