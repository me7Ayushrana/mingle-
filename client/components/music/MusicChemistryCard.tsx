import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChemistryData {
  chemistryPercent: number;
  sharedArtistsCount: number;
  sharedTracksCount: number;
  genreOverlap: string;
  similarListeningPatterns: string;
  discoveryCount: number;
}

interface MusicChemistryCardProps {
  chemistry: ChemistryData | null;
  theirName: string;
}

const CARD_BG = 'rgba(255,255,255,0.04)';

function genreOverlapColor(level: string): string {
  const lower = level.toLowerCase();
  if (lower === 'high') return '#34D399';
  if (lower === 'medium') return '#FBBF24';
  return '#F87171';
}

function patternColor(pattern: string): string {
  const lower = pattern.toLowerCase();
  if (lower === 'strong') return '#34D399';
  if (lower === 'moderate') return '#FBBF24';
  return '#F87171';
}

interface RowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function ChemistryRow({ label, value, valueColor }: RowProps) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default function MusicChemistryCard({ chemistry, theirName }: MusicChemistryCardProps) {
  if (!chemistry) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={32} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>
            Connect Spotify to see Music Chemistry
          </Text>
          <Text style={styles.emptySubtext}>with {theirName}</Text>
        </View>
      </View>
    );
  }

  const {
    chemistryPercent,
    sharedArtistsCount,
    sharedTracksCount,
    genreOverlap,
    similarListeningPatterns,
    discoveryCount,
  } = chemistry;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎧</Text>
        <Text style={styles.headerTitle}>Music Chemistry</Text>
        <Text style={styles.headerSubtitle}>with {theirName}</Text>
      </View>

      {/* Large percentage */}
      <View style={styles.percentWrapper}>
        <Text style={styles.percentNumber}>{chemistryPercent}</Text>
        <Text style={styles.percentSign}>%</Text>
      </View>

      {/* Breakdown table */}
      <View style={styles.table}>
        <ChemistryRow
          label="Shared artists"
          value={String(sharedArtistsCount)}
        />
        <ChemistryRow
          label="Shared tracks"
          value={String(sharedTracksCount)}
        />
        <ChemistryRow
          label="Genre overlap"
          value={genreOverlap}
          valueColor={genreOverlapColor(genreOverlap)}
        />
        <ChemistryRow
          label="Listening patterns"
          value={similarListeningPatterns}
          valueColor={patternColor(similarListeningPatterns)}
        />
      </View>

      {/* Discovery teaser */}
      {discoveryCount > 0 && (
        <View style={styles.discoveryRow}>
          <Ionicons name="sparkles-outline" size={14} color="#6C63FF" />
          <Text style={styles.discoveryText}>
            {discoveryCount} artist{discoveryCount !== 1 ? 's' : ''} to explore together
          </Text>
        </View>
      )}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>A fun signal, not a prediction</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 14,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginLeft: 2,
  },
  percentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  percentNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FF6B8A',
    lineHeight: 80,
    // React Native doesn't support gradient text natively;
    // for true gradient text use MaskedView + LinearGradient.
    // Using the pink anchor colour as a close approximation.
  },
  percentSign: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 12,
    marginLeft: 4,
  },
  table: {
    gap: 0,
  },
  discoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  discoveryText: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    textAlign: 'center',
  },
});
