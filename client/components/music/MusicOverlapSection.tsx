import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArtistChip {
  name: string;
  imageUrl?: string;
}

interface MusicOverlap {
  sharedArtists: ArtistChip[];
  youMightIntroduceThem: ArtistChip[];
  theyMightIntroduceYou: ArtistChip[];
}

interface MusicOverlapSectionProps {
  overlap: MusicOverlap | null;
  theirName: string;
  myName: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ArtistPill({ name, imageUrl }: ArtistChip) {
  return (
    <View style={styles.pill}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.pillImage}
          accessibilityLabel={name}
        />
      ) : (
        <View style={styles.pillImagePlaceholder}>
          <Text style={styles.pillImageLetter}>{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.pillText} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function SmallArtistRow({ artists }: { artists: ArtistChip[] }) {
  if (artists.length === 0) return null;
  return (
    <View style={styles.smallList}>
      {artists.map((a, i) => (
        <Text key={i} style={styles.smallArtistText} numberOfLines={1}>
          {a.name}
          {i < artists.length - 1 ? ' · ' : ''}
        </Text>
      ))}
    </View>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MusicOverlapSection({
  overlap,
  theirName,
  myName,
}: MusicOverlapSectionProps) {
  const hasSharedArtists = overlap && overlap.sharedArtists.length > 0;

  // ── Empty / not connected ──
  if (!overlap || !hasSharedArtists) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes-outline" size={24} color="#52525B" />
        <Text style={styles.emptyTitle}>No music overlap yet</Text>
        <Text style={styles.emptySubtitle}>
          Connect Spotify to see what music you share with {theirName}
        </Text>
      </View>
    );
  }

  const sharedSlice = overlap.sharedArtists.slice(0, 6);
  const youIntroduce = overlap.youMightIntroduceThem;
  const theyIntroduce = overlap.theyMightIntroduceYou;

  return (
    <View style={styles.container}>
      {/* ── Shared artists ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>🎵 You both listen to…</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {sharedSlice.map((artist, i) => (
            <ArtistPill key={i} name={artist.name} imageUrl={artist.imageUrl} />
          ))}
        </ScrollView>
      </View>

      {/* ── You might introduce them ── */}
      {youIntroduce.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              💡 You might introduce {theirName} to…
            </Text>
            <SmallArtistRow artists={youIntroduce} />
          </View>
        </>
      )}

      {/* ── They might introduce you ── */}
      {theyIntroduce.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              ✨ {theirName} might introduce {myName} to…
            </Text>
            <SmallArtistRow artists={theyIntroduce} />
          </View>
        </>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A26',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.15)',
    overflow: 'hidden',
  },
  section: {
    padding: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
    maxWidth: 160,
  },
  pillImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  pillImagePlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillImageLetter: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  pillText: {
    fontSize: 13,
    color: '#FAFAFA',
    fontWeight: '500',
    flexShrink: 1,
  },
  smallList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallArtistText: {
    fontSize: 13,
    color: '#71717A',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#52525B',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#3F3F46',
    textAlign: 'center',
    lineHeight: 18,
  },
});
