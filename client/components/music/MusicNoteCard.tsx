import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SongCard from './SongCard';

interface MusicNote {
  id: string;
  text: string;
  mood?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  spotifyUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

interface MusicNoteCardProps {
  note: MusicNote;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenSpotify?: (url: string) => void;
}

const CARD_BG = 'rgba(255,255,255,0.04)';

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function hoursUntil(isoString: string): number {
  return Math.max(0, Math.floor((new Date(isoString).getTime() - Date.now()) / 3600000));
}

const MOOD_COLORS: Record<string, string> = {
  happy: '#FFD60A',
  sad: '#60A5FA',
  hyped: '#F97316',
  chill: '#34D399',
  romantic: '#FB7185',
};

export default function MusicNoteCard({
  note,
  isOwner,
  onEdit,
  onDelete,
  onOpenSpotify,
}: MusicNoteCardProps) {
  const hasTrack = Boolean(note.trackName && note.artistName);
  const moodColor = note.mood ? (MOOD_COLORS[note.mood.toLowerCase()] ?? 'rgba(255,255,255,0.2)') : undefined;

  return (
    <View style={styles.card}>
      {/* Linked track */}
      {hasTrack && note.trackName && note.artistName && (
        <View style={styles.trackSection}>
          <SongCard
            track={{
              name: note.trackName,
              artistName: note.artistName,
              albumArt: note.albumArt,
              spotifyUrl: note.spotifyUrl ?? '',
            }}
            compact
            showSpotifyLink={Boolean(note.spotifyUrl)}
            onPress={
              note.spotifyUrl && onOpenSpotify
                ? () => onOpenSpotify(note.spotifyUrl!)
                : undefined
            }
          />
        </View>
      )}

      {/* Note text */}
      <Text style={styles.noteText}>{note.text}</Text>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <Text style={styles.timestamp}>{timeAgo(note.createdAt)}</Text>

        {/* Mood chip */}
        {note.mood && moodColor && (
          <View style={[styles.moodChip, { backgroundColor: `${moodColor}22`, borderColor: moodColor }]}>
            <Text style={[styles.moodText, { color: moodColor }]}>{note.mood}</Text>
          </View>
        )}

        {/* Expiry chip */}
        {note.expiresAt && (
          <View style={styles.expiryChip}>
            <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.4)" />
            <Text style={styles.expiryText}>
              Expires in {hoursUntil(note.expiresAt)}h
            </Text>
          </View>
        )}

        {/* Owner actions */}
        {isOwner && (
          <View style={styles.ownerActions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="pencil-outline" size={15} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={15} color="#FF4D6A" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  trackSection: {
    marginBottom: 2,
  },
  noteText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
  moodChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expiryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  expiryText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
});
