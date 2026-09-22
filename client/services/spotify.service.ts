import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyPlaylist,
  CurrentListening,
  SongOfTheDay,
  SpotifyStatus,
} from '@/types/music';

// ─── Mock data (used when Spotify not connected) ─────────────────────────────

export const MOCK_ARTISTS: SpotifyArtist[] = [
  { spotifyId: 'mock-a1', name: 'Arctic Monkeys', genres: ['indie rock', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f', spotifyUrl: 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH', popularity: 85 },
  { spotifyId: 'mock-a2', name: 'The Weeknd', genres: ['r&b', 'pop'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', spotifyUrl: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ', popularity: 97 },
  { spotifyId: 'mock-a3', name: 'Frank Ocean', genres: ['r&b', 'indie soul'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb318a3e4f9c4e1c3e2b7e1f0a', spotifyUrl: 'https://open.spotify.com/artist/2h93pZq0e7k5yf4dywlkpM', popularity: 88 },
  { spotifyId: 'mock-a4', name: 'Coldplay', genres: ['pop rock', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb3ad3a69be2cae46ce0d13b71', spotifyUrl: 'https://open.spotify.com/artist/4gzpq5DPGxSnKTe4SA8HAU', popularity: 92 },
  { spotifyId: 'mock-a5', name: 'Hozier', genres: ['indie folk', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eba0d10728b3cc2c80a5e52fd2', spotifyUrl: 'https://open.spotify.com/artist/2FXC3k01G6Gw61bmprjgqS', popularity: 80 },
];

export const MOCK_TRACKS: SpotifyTrack[] = [
  { spotifyId: 'mock-t1', name: 'I Wanna Be Yours', artistName: 'Arctic Monkeys', albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163', spotifyUrl: 'https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n', durationMs: 193000 },
  { spotifyId: 'mock-t2', name: 'Die For You', artistName: 'The Weeknd', albumArt: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a', spotifyUrl: 'https://open.spotify.com/track/2p8IUWQDrpjuFltbdgLOag', durationMs: 260000 },
  { spotifyId: 'mock-t3', name: 'Pyramids', artistName: 'Frank Ocean', albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526', spotifyUrl: 'https://open.spotify.com/track/7JfHr0j9sFRkDKhHOCfvVQ', durationMs: 548000 },
  { spotifyId: 'mock-t4', name: 'The Scientist', artistName: 'Coldplay', albumArt: 'https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82', spotifyUrl: 'https://open.spotify.com/track/75JFxkI2RXiU7L9VXzMkle', durationMs: 307000 },
  { spotifyId: 'mock-t5', name: 'Take Me to Church', artistName: 'Hozier', albumArt: 'https://i.scdn.co/image/ab67616d0000b273bb0059c87b3b3c52f2c04b3c', spotifyUrl: 'https://open.spotify.com/track/1CS7Sd1u5tWkstBhpssyjP', durationMs: 242000 },
];

export const MOCK_PLAYLISTS: SpotifyPlaylist[] = [
  { spotifyId: 'mock-p1', name: '🌙 Late Night Drives', description: 'For when the city feels like yours', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U', trackCount: 24, isPublic: true, isSelectedForProfile: true },
  { spotifyId: 'mock-p2', name: '🏋️ Gym Mode', description: 'No days off', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ', trackCount: 67, isPublic: true, isSelectedForProfile: false },
  { spotifyId: 'mock-p3', name: '❤️ Songs I\'d Send You', description: 'Carefully curated feelings', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX7F6T2n2fegs', trackCount: 18, isPublic: true, isSelectedForProfile: true },
];

// ─── Service ─────────────────────────────────────────────────────────────────

export const spotifyService = {
  async getStatus(): Promise<SpotifyStatus> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.status);
      return data;
    } catch {
      return { connected: false };
    }
  },

  async getAuthUrl(): Promise<string | null> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.authUrl);
      return data.url || null;
    } catch {
      return null;
    }
  },

  async disconnect(): Promise<void> {
    try {
      await apiClient.post(endpoints.spotify.disconnect);
    } catch (err) {
      console.warn('Spotify disconnect error:', err);
    }
  },

  async getTopArtists(): Promise<SpotifyArtist[]> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.topArtists);
      return data.data || MOCK_ARTISTS;
    } catch {
      return MOCK_ARTISTS;
    }
  },

  async getTopTracks(): Promise<SpotifyTrack[]> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.topTracks);
      return data.data || MOCK_TRACKS;
    } catch {
      return MOCK_TRACKS;
    }
  },

  async getPlaylists(): Promise<SpotifyPlaylist[]> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.playlists);
      return data.data || MOCK_PLAYLISTS;
    } catch {
      return MOCK_PLAYLISTS;
    }
  },

  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.currentlyPlaying);
      return data.data || null;
    } catch {
      return null;
    }
  },

  async shareCurrent(payload: {
    trackId?: string;
    trackName: string;
    artistName: string;
    albumArt?: string;
    spotifyUrl?: string;
    shortMessage?: string;
    isActive: boolean;
  }): Promise<void> {
    try {
      if (payload.isActive) {
        await apiClient.post(endpoints.spotify.shareCurrent, payload);
      } else {
        await apiClient.delete(endpoints.spotify.shareCurrent);
      }
    } catch (err) {
      console.warn('shareCurrent error:', err);
    }
  },

  async setSongOfDay(track: {
    spotifyId?: string;
    trackName: string;
    artistName: string;
    albumArt?: string;
    spotifyUrl?: string;
  }): Promise<void> {
    try {
      await apiClient.post(endpoints.spotify.songOfDay, track);
    } catch (err) {
      console.warn('setSongOfDay error:', err);
    }
  },

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    if (!query.trim()) return [];
    try {
      const { data } = await apiClient.get(endpoints.spotify.search, { params: { q: query } });
      return data.data || [];
    } catch {
      // Fallback: filter mock tracks by query
      return MOCK_TRACKS.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.artistName.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  async getRecentlyPlayed(): Promise<SpotifyTrack[]> {
    try {
      const { data } = await apiClient.get(endpoints.spotify.recentlyPlayed);
      return data.data || [];
    } catch {
      return MOCK_TRACKS.slice(0, 3);
    }
  },
};
