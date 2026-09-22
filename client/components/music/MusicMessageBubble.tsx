import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MusicMessageData {
  id: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  message?: string;
  likes: string[];
  createdAt: string;
}

interface MusicMessageBubbleProps {
  message: MusicMessageData;
  senderName: string;
  isMine: boolean;
  onLike: () => void;
  onOpenSpotify: (url: string) => void;
  currentUserId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${minutes} ${ampm}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MusicMessageBubble({
  message,
  senderName,
  isMine,
  onLike,
  onOpenSpotify,
  currentUserId,
}: MusicMessageBubbleProps) {
  const likeCount = message.likes.length;
  const isLiked = message.likes.includes(currentUserId);
  const headerLabel = isMine ? 'You sent a song 🎧' : `${senderName} sent you a song 🎧`;

  const handleOpenSpotify = useCallback(() => {
    onOpenSpotify(message.spotifyUrl);
  }, [onOpenSpotify, message.spotifyUrl]);

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {/* Header */}
        <Text style={styles.header}>{headerLabel}</Text>

        {/* Track info */}
        <View style={styles.trackRow}>
          {message.albumArt ? (
            <Image
              source={{ uri: message.albumArt }}
              style={styles.albumArt}
              accessibilityLabel={`${message.trackName} album art`}
            />
          ) : (
            <View style={styles.albumArtPlaceholder}>
              <Ionicons name="musical-note" size={22} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              {message.trackName}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {message.artistName}
            </Text>
          </View>
        </View>

        {/* Optional message */}
        {message.message ? (
          <Text style={styles.messageText}>"{message.message}"</Text>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer row */}
        <View style={styles.footer}>
          {/* Like button */}
          <Pressable
            onPress={onLike}
            style={({ pressed }) => [styles.likeButton, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Unlike' : 'Like'}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#EC4899' : '#71717A'}
            />
            {likeCount > 0 && (
              <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                {likeCount}
              </Text>
            )}
          </Pressable>

          {/* Play on Spotify */}
          <Pressable
            onPress={handleOpenSpotify}
            style={({ pressed }) => [styles.spotifyButton, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Play on Spotify"
          >
            <Ionicons name="logo-soundcloud" size={14} color="#000000" />
            <Text style={styles.spotifyButtonText}>Play on Spotify</Text>
          </Pressable>
        </View>

        {/* Attribution + time */}
        <View style={styles.bottomRow}>
          <Text style={styles.attribution}>Powered by Spotify</Text>
          <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  wrapperMine: {
    alignItems: 'flex-end',
  },
  wrapperTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    width: 280,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  bubbleMine: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    borderColor: 'rgba(108, 99, 255, 0.3)',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#1A1A26',
    borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  header: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  albumArtPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 2,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  artistName: {
    fontSize: 13,
    color: '#71717A',
  },
  messageText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  likeCount: {
    fontSize: 13,
    color: '#71717A',
  },
  likeCountActive: {
    color: '#EC4899',
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  spotifyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attribution: {
    fontSize: 10,
    color: '#3F3F46',
  },
  time: {
    fontSize: 10,
    color: '#52525B',
  },
});
