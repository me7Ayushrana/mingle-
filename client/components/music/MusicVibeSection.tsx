import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import VoiceIntroPlayer from './VoiceIntroPlayer';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoiceIntroData {
  audioData: string;
  durationSeconds: number;
}

interface CurrentListeningData {
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
}

interface TopArtist {
  name: string;
}

interface MusicVibeSectionProps {
  userId: string;
  voiceIntro: VoiceIntroData | null;
  currentListening: CurrentListeningData | null;
  topArtists: TopArtist[] | null;
  isOwner: boolean;
  onManageMusic?: () => void;
  onAddVoiceIntro?: () => void;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionDivider() {
  return <View style={styles.divider} />;
}

function ArtistChip({ name }: { name: string }) {
  return (
    <View style={styles.artistChip}>
      <Text style={styles.artistChipText} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function CurrentListeningMini({ track }: { track: CurrentListeningData }) {
  const handleOpen = () => {
    Linking.openURL(track.spotifyUrl).catch(() => null);
  };

  return (
    <View style={styles.nowPlayingRow}>
      <View style={styles.nowPlayingDot} />
      <View style={styles.nowPlayingInfo}>
        <Text style={styles.nowPlayingTrack} numberOfLines={1}>
          {track.trackName}
        </Text>
        <Text style={styles.nowPlayingArtist} numberOfLines={1}>
          {track.artistName}
        </Text>
      </View>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.openSpotifyButton, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel="Open on Spotify"
      >
        <Ionicons name="open-outline" size={14} color="#1DB954" />
      </Pressable>
    </View>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MusicVibeSection({
  voiceIntro,
  currentListening,
  topArtists,
  isOwner,
  onManageMusic,
  onAddVoiceIntro,
}: MusicVibeSectionProps) {
  const hasVoiceIntro = !!voiceIntro;
  const hasCurrentListening = !!currentListening;
  const hasTopArtists = topArtists !== null && topArtists.length > 0;
  const hasAnything = hasVoiceIntro || hasCurrentListening || hasTopArtists;

  // ── Empty state (non-owner, nothing to show) ──
  if (!hasAnything && !isOwner) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>🎧 My Vibe</Text>
        <Text style={styles.emptyText}>No music shared yet</Text>
      </View>
    );
  }

  const artistsSlice = (topArtists ?? []).slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Section header */}
      <Text style={styles.sectionHeader}>🎧 My Vibe</Text>

      {/* ── Voice intro ── */}
      {hasVoiceIntro && voiceIntro ? (
        <View style={styles.subsection}>
          <Text style={styles.subsectionLabel}>Voice intro</Text>
          <VoiceIntroPlayer
            audioData={voiceIntro.audioData}
            durationSeconds={voiceIntro.durationSeconds}
          />
        </View>
      ) : isOwner ? (
        <View style={styles.subsection}>
          <View style={styles.noVoiceRow}>
            <Ionicons name="mic-off-outline" size={16} color="#52525B" />
            <Text style={styles.noVoiceText}>No voice intro added</Text>
            {onAddVoiceIntro && (
              <Pressable
                onPress={onAddVoiceIntro}
                style={({ pressed }) => [styles.addVoiceButton, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
              >
                <Text style={styles.addVoiceButtonText}>+ Add</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}

      {/* ── Currently listening ── */}
      {hasCurrentListening && currentListening ? (
        <>
          <SectionDivider />
          <View style={styles.subsection}>
            <Text style={styles.subsectionLabel}>Currently listening</Text>
            <CurrentListeningMini track={currentListening} />
          </View>
        </>
      ) : null}

      {/* ── Top artists ── */}
      {hasTopArtists && artistsSlice.length > 0 ? (
        <>
          <SectionDivider />
          <View style={styles.subsection}>
            <Text style={styles.subsectionLabel}>Top artists</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistRow}
            >
              {artistsSlice.map((a, i) => (
                <ArtistChip key={i} name={a.name} />
              ))}
            </ScrollView>
          </View>
        </>
      ) : null}

      {/* ── Manage music (owner only) ── */}
      {isOwner && onManageMusic ? (
        <>
          <SectionDivider />
          <Pressable
            onPress={onManageMusic}
            style={({ pressed }) => [styles.manageRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
          >
            <Text style={styles.manageText}>Manage Music Profile</Text>
            <Ionicons name="chevron-forward" size={14} color="#6C63FF" />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A26',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FAFAFA',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  subsection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subsectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
  noVoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noVoiceText: {
    flex: 1,
    fontSize: 13,
    color: '#52525B',
    fontStyle: 'italic',
  },
  addVoiceButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  addVoiceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(29, 185, 84, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.15)',
    padding: 10,
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1DB954',
  },
  nowPlayingInfo: {
    flex: 1,
    gap: 1,
  },
  nowPlayingTrack: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  nowPlayingArtist: {
    fontSize: 12,
    color: '#71717A',
  },
  openSpotifyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 185, 84, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistRow: {
    flexDirection: 'row',
    gap: 8,
  },
  artistChip: {
    backgroundColor: '#27272A',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    maxWidth: 140,
  },
  artistChipText: {
    fontSize: 13,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  manageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  emptyText: {
    fontSize: 14,
    color: '#52525B',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
