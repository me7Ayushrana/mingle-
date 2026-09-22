import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpotifyConnectBannerProps {
  connected: boolean;
  displayName?: string;
  profileImageUrl?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

const SPOTIFY_GREEN = '#1DB954';
const CARD_BG = 'rgba(255,255,255,0.04)';

export default function SpotifyConnectBanner({
  connected,
  displayName,
  profileImageUrl,
  onConnect,
  onDisconnect,
  loading = false,
}: SpotifyConnectBannerProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={SPOTIFY_GREEN} size="small" />
        <Text style={styles.loadingText}>Connecting to Spotify…</Text>
      </View>
    );
  }

  if (connected) {
    return (
      <View style={[styles.card, styles.connectedCard]}>
        <View style={styles.connectedRow}>
          <View style={styles.greenDot} />
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <Ionicons name="musical-notes" size={18} color={SPOTIFY_GREEN} />
          )}
          <View style={styles.connectedTextGroup}>
            <Text style={styles.connectedLabel}>Connected to Spotify</Text>
            {displayName ? (
              <Text style={styles.displayName}>{displayName}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={onDisconnect} style={styles.disconnectBtn}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.attribution}>Music data provided by Spotify</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="musical-notes" size={32} color={SPOTIFY_GREEN} />
      </View>
      <Text style={styles.title}>Connect Spotify</Text>
      <Text style={styles.subtitle}>
        Share your music taste & discover compatibility
      </Text>
      <TouchableOpacity style={styles.connectBtn} onPress={onConnect} activeOpacity={0.8}>
        <Ionicons name="musical-notes" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.connectBtnText}>Connect Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  connectedCard: {
    alignItems: 'stretch',
    padding: 14,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginTop: 8,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SPOTIFY_GREEN,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  connectedTextGroup: {
    flex: 1,
    marginLeft: 4,
  },
  connectedLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  displayName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 1,
  },
  disconnectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  disconnectText: {
    color: '#FF4D6A',
    fontSize: 13,
    fontWeight: '500',
  },
  attribution: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(29,185,84,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
