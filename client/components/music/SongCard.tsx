import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SongTrack {
  spotifyId?: string;
  name: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  durationMs?: number;
}

interface SongCardProps {
  track: SongTrack;
  onPress?: () => void;
  showSpotifyLink?: boolean;
  compact?: boolean;
  selected?: boolean;
}

const SPOTIFY_GREEN = '#1DB954';
const CARD_BG = 'rgba(255,255,255,0.04)';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SongCard({
  track,
  onPress,
  showSpotifyLink = true,
  compact = false,
  selected = false,
}: SongCardProps) {
  const artSize = compact ? 36 : 48;
  const artRadius = compact ? 4 : 6;

  const handleOpenSpotify = () => {
    Linking.openURL(track.spotifyUrl).catch(() => {
      // silently ignore if Spotify not installed
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
      ]}
    >
      {track.albumArt ? (
        <Image
          source={{ uri: track.albumArt }}
          style={{ width: artSize, height: artSize, borderRadius: artRadius }}
        />
      ) : (
        <View
          style={[
            styles.albumArtPlaceholder,
            { width: artSize, height: artSize, borderRadius: artRadius },
          ]}
        >
          <Ionicons
            name="musical-note"
            size={compact ? 16 : 22}
            color="rgba(255,255,255,0.3)"
          />
        </View>
      )}

      <View style={styles.info}>
        <Text
          style={[styles.trackName, compact && styles.trackNameCompact]}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {track.artistName}
        </Text>
      </View>

      <View style={styles.right}>
        {track.durationMs !== undefined && (
          <Text style={styles.duration}>{formatDuration(track.durationMs)}</Text>
        )}
        {showSpotifyLink && (
          <TouchableOpacity
            onPress={handleOpenSpotify}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="open-outline"
              size={14}
              color={SPOTIFY_GREEN}
              style={track.durationMs !== undefined ? { marginTop: 4 } : undefined}
            />
          </TouchableOpacity>
        )}
      </View>

      {selected && <View style={styles.selectedBar} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardCompact: {
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  cardSelected: {
    borderColor: 'rgba(29,185,84,0.35)',
    backgroundColor: 'rgba(29,185,84,0.06)',
  },
  albumArtPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  trackName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  trackNameCompact: {
    fontSize: 13,
  },
  artistName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  duration: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
  },
  selectedBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: SPOTIFY_GREEN,
  },
});
