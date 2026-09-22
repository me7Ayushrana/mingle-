import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Track {
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  sharedAt?: string;
  shortMessage?: string;
}

interface CurrentlyListeningCardProps {
  track: Track | null;
  isSharing: boolean;
  onToggleShare: (isActive: boolean) => void;
  onOpenSpotify: (url: string) => void;
}

const SPOTIFY_GREEN = '#1DB954';
const CARD_BG = 'rgba(255,255,255,0.04)';

function timeAgo(isoString?: string): string {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return `${diff} min ago`;
}

export default function CurrentlyListeningCard({
  track,
  isSharing,
  onToggleShare,
  onOpenSpotify,
}: CurrentlyListeningCardProps) {
  const isEmpty = !track && !isSharing;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="headset" size={16} color={SPOTIFY_GREEN} />
        <Text style={styles.headerTitle}>Currently Listening</Text>
      </View>

      {isEmpty && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎧</Text>
          <Text style={styles.emptyText}>Nothing playing right now</Text>
        </View>
      )}

      {track && (
        <View style={styles.trackRow}>
          {track.albumArt ? (
            <Image source={{ uri: track.albumArt }} style={styles.albumArt} />
          ) : (
            <View style={styles.albumArtPlaceholder}>
              <Ionicons name="musical-note" size={24} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              {track.trackName}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artistName}
            </Text>
            {track.shortMessage ? (
              <Text style={styles.shortMessage} numberOfLines={2}>
                {track.shortMessage}
              </Text>
            ) : null}
            <View style={styles.trackMeta}>
              {track.sharedAt ? (
                <Text style={styles.timestamp}>{timeAgo(track.sharedAt)}</Text>
              ) : null}
              <TouchableOpacity
                onPress={() => onOpenSpotify(track.spotifyUrl)}
                style={styles.spotifyBtn}
                activeOpacity={0.75}
              >
                <Ionicons name="musical-notes" size={12} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.spotifyBtnText}>Open in Spotify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.shareToggleRow}>
        <Text style={styles.shareLabel}>Share my listening activity</Text>
        <Switch
          value={isSharing}
          onValueChange={onToggleShare}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: SPOTIFY_GREEN }}
          thumbColor="#fff"
        />
      </View>

      {isEmpty && (
        <TouchableOpacity
          style={styles.shareTrackBtn}
          onPress={() => onToggleShare(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="share-outline" size={15} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.shareTrackBtnText}>Share Current Track</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.attribution}>Powered by Spotify</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  albumArtPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 3,
  },
  trackName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  artistName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  shortMessage: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
  },
  spotifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  spotifyBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  shareToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  shareLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  shareTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareTrackBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  attribution: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    textAlign: 'center',
  },
});
