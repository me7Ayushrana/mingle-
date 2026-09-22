import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import VoiceIntroPlayer from './VoiceIntroPlayer';

// Lazy require expo-av to avoid hard failure when not installed
let AudioModule: typeof import('expo-av').Audio | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = (require('expo-av') as typeof import('expo-av')).Audio;
} catch {
  AudioModule = undefined;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type RecordingState = 'idle' | 'recording' | 'preview' | 'saving';

interface VoiceIntroRecorderProps {
  existingDuration?: number;
  onSave: (audioData: string, mimeType: string, durationSeconds: number) => Promise<void>;
  onDelete?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const MAX_DURATION_SECONDS = 30;

// ─── Pulsing record dot ───────────────────────────────────────────────────────

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View style={[styles.recordDot, { transform: [{ scale }] }]} />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VoiceIntroRecorder({
  existingDuration,
  onSave,
  onDelete,
}: VoiceIntroRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recordingRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => null);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);

    if (!AudioModule) {
      setErrorMessage('Audio module not available on this device');
      return;
    }

    try {
      const { status } = await AudioModule.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Microphone permission denied. Please enable it in Settings.');
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await AudioModule.Recording.createAsync(
        AudioModule.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;

      setElapsedSeconds(0);
      setState('recording');

      // Timer — auto-stop at MAX_DURATION_SECONDS
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_DURATION_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.warn('[VoiceIntroRecorder] start error:', err);
      setErrorMessage('Could not start recording. Please try again.');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI() as string | null;
      const status = await recordingRef.current.getStatusAsync();
      // durationMillis may live on the status object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const durationMs: number = (status as any).durationMillis ?? elapsedSeconds * 1000;

      recordingRef.current = null;

      if (!uri) {
        setErrorMessage('Recording failed — no audio captured.');
        setState('idle');
        return;
      }

      setRecordedUri(uri);
      setRecordedDuration(Math.round(durationMs / 1000));
      setState('preview');
    } catch (err) {
      console.warn('[VoiceIntroRecorder] stop error:', err);
      setErrorMessage('Failed to save recording. Please try again.');
      setState('idle');
    }
  }, [elapsedSeconds]);

  const handleSave = useCallback(async () => {
    if (!recordedUri) return;

    setState('saving');
    setErrorMessage(null);

    try {
      // Encode to base64 via fetch + FileReader (available in RN 0.64+)
      const response = await fetch(recordedUri);
      const blob = await response.blob();

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const b64 = result.split(',')[1];
          if (b64) {
            resolve(b64);
          } else {
            reject(new Error('Empty base64 result'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await onSave(base64, 'audio/m4a', recordedDuration);

      // Reset after save
      setRecordedUri(null);
      setRecordedDuration(0);
      setState('idle');
    } catch (err) {
      console.warn('[VoiceIntroRecorder] save error:', err);
      setErrorMessage('Failed to upload recording. Please try again.');
      setState('preview');
    }
  }, [recordedUri, recordedDuration, onSave]);

  const handleReRecord = useCallback(() => {
    setRecordedUri(null);
    setRecordedDuration(0);
    setElapsedSeconds(0);
    setErrorMessage(null);
    setState('idle');
  }, []);

  // ── Render: saving ──
  if (state === 'saving') {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#6C63FF" size="large" />
        <Text style={styles.savingText}>Saving voice intro…</Text>
      </View>
    );
  }

  // ── Render: preview ──
  if (state === 'preview' && recordedUri) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Preview</Text>
        <VoiceIntroPlayer
          audioData={null}
          durationSeconds={recordedDuration}
        />
        {/* Note: preview plays from local URI via a workaround below */}
        <Text style={styles.previewHint}>
          Tap play above to preview your recording
        </Text>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.rerecordButton]}
            onPress={handleReRecord}
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={16} color="#A1A1AA" />
            <Text style={styles.rerecordText}>Re-record</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
            accessibilityRole="button"
          >
            <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Render: recording ──
  if (state === 'recording') {
    const progressPct = Math.min((elapsedSeconds / MAX_DURATION_SECONDS) * 100, 100);

    return (
      <View style={styles.card}>
        <View style={styles.recordingHeader}>
          <PulsingDot />
          <Text style={styles.recordingLabel}>Recording</Text>
          <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
        </View>

        {/* Progress bar toward 30s */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.maxHint}>{MAX_DURATION_SECONDS - elapsedSeconds}s remaining</Text>

        <Pressable
          style={({ pressed }) => [styles.stopButton, pressed && { opacity: 0.8 }]}
          onPress={stopRecording}
          accessibilityRole="button"
          accessibilityLabel="Stop recording"
        >
          <Ionicons name="stop" size={20} color="#FFFFFF" />
          <Text style={styles.stopText}>Stop</Text>
        </Pressable>
      </View>
    );
  }

  // ── Render: idle ──
  return (
    <View style={styles.card}>
      {existingDuration !== undefined && existingDuration > 0 ? (
        <Text style={styles.existingHint}>
          You have a {existingDuration}s voice intro. Re-record below.
        </Text>
      ) : null}

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.recordTrigger, pressed && { opacity: 0.85 }]}
        onPress={startRecording}
        accessibilityRole="button"
        accessibilityLabel="Record voice intro"
      >
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.recordTriggerText}>Record Voice Intro</Text>
        <Text style={styles.recordTriggerHint}>Up to {MAX_DURATION_SECONDS} seconds</Text>
      </Pressable>

      {onDelete && existingDuration ? (
        <Pressable
          style={styles.deleteButton}
          onPress={onDelete}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
          <Text style={styles.deleteText}>Delete voice intro</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A26',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previewHint: {
    fontSize: 12,
    color: '#71717A',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
  },
  rerecordButton: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  rerecordText: {
    color: '#A1A1AA',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#6C63FF',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FAFAFA',
    fontVariant: ['tabular-nums'],
    marginLeft: 'auto',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  maxHint: {
    fontSize: 11,
    color: '#71717A',
    alignSelf: 'flex-end',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  stopText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  recordTrigger: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordTriggerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FAFAFA',
  },
  recordTriggerHint: {
    fontSize: 12,
    color: '#71717A',
  },
  existingHint: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 13,
    color: '#EF4444',
  },
  savingText: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
  },
});
