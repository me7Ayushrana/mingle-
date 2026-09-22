import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// expo-av is an optional peer — lazy require so the module graph doesn't hard-fail
// when the package isn't present during bare type-checking.
let AudioModule: typeof import('expo-av').Audio | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = (require('expo-av') as typeof import('expo-av')).Audio;
} catch {
  AudioModule = undefined;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoiceIntroPlayerProps {
  audioData: string | null;
  durationSeconds: number;
  isLoading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Waveform bars ───────────────────────────────────────────────────────────

const BAR_HEIGHTS: number[] = [14, 22, 18, 26, 16, 20];

function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const anims = useRef<Animated.Value[]>(
    BAR_HEIGHTS.map(() => new Animated.Value(1)),
  ).current;
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    loopsRef.current.forEach((l) => l.stop());
    loopsRef.current = [];

    if (isPlaying) {
      anims.forEach((anim, i) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.35 + (i % 3) * 0.2,
              duration: 350 + i * 70,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 350 + i * 70,
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
        loopsRef.current.push(loop);
      });
    } else {
      anims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }

    return () => {
      loopsRef.current.forEach((l) => l.stop());
    };
  }, [isPlaying, anims]);

  return (
    <View style={styles.waveformContainer}>
      {BAR_HEIGHTS.map((h, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: h,
              transform: [{ scaleY: anims[i] ?? new Animated.Value(1) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VoiceIntroPlayer({
  audioData,
  durationSeconds,
  isLoading = false,
}: VoiceIntroPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [totalDurationMs, setTotalDurationMs] = useState(durationSeconds * 1000);
  const [error, setError] = useState<string | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const soundRef = useRef<any>(null);

  // Unload on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => null);
    };
  }, []);

  // Reset when audioData changes
  useEffect(() => {
    setIsPlaying(false);
    setPositionMs(0);
    setSoundLoaded(false);
    setError(null);
    soundRef.current?.unloadAsync().catch(() => null);
    soundRef.current = null;
  }, [audioData]);

  const handlePlayPause = useCallback(async () => {
    if (!audioData) return;

    if (!AudioModule) {
      setError('Audio playback not available on this device');
      return;
    }

    try {
      setError(null);

      if (!soundRef.current) {
        const { sound } = await AudioModule.Sound.createAsync(
          { uri: `data:audio/m4a;base64,${audioData}` },
          { shouldPlay: false },
        );

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) {
            if (status.error) {
              setError('Playback error — audio may be corrupted');
              setIsPlaying(false);
            }
            return;
          }
          setPositionMs(status.positionMillis);
          if (status.durationMillis !== undefined && status.durationMillis > 0) {
            setTotalDurationMs(status.durationMillis);
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPositionMs(0);
            sound.setPositionAsync(0).catch(() => null);
          }
        });

        soundRef.current = sound;
        setSoundLoaded(true);
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('[VoiceIntroPlayer] playback error:', err);
      setError('Unable to play audio');
      setIsPlaying(false);
    }
  }, [audioData, isPlaying]);

  const progress = totalDurationMs > 0 ? Math.min(positionMs / totalDurationMs, 1) : 0;
  const elapsedSec = Math.floor(positionMs / 1000);
  const remainingSec = Math.max(0, durationSeconds - elapsedSec);

  // ── No audio ──
  if (!audioData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mic-off-outline" size={20} color="#52525B" />
        <Text style={styles.emptyText}>No voice intro recorded</Text>
      </View>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color="#6C63FF" size="small" />
        <Text style={styles.loadingText}>Loading audio…</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Play / Pause */}
      <Pressable
        onPress={handlePlayPause}
        style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
        accessibilityLabel={isPlaying ? 'Pause voice intro' : 'Play voice intro'}
        accessibilityRole="button"
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
      </Pressable>

      {/* Waveform + progress */}
      <View style={styles.centerSection}>
        <WaveformBars isPlaying={isPlaying} />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>

      {/* Duration label */}
      <Text style={styles.duration}>
        {soundLoaded
          ? `${formatDuration(elapsedSec)} / ${formatDuration(Math.floor(totalDurationMs / 1000))}`
          : formatDuration(remainingSec)}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A26',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    padding: 12,
    gap: 12,
  },
  loadingCard: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  centerSection: {
    flex: 1,
    gap: 6,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#6C63FF',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    color: '#A1A1AA',
    fontVariant: ['tabular-nums'],
    minWidth: 38,
    textAlign: 'right',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#52525B',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 14,
    color: '#A1A1AA',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
  },
});
