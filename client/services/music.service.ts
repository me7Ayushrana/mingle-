import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type {
  MusicProfile,
  MusicNote,
  CreateMusicNotePayload,
  VoiceIntro,
  MusicChemistry,
  MusicOverlap,
  MusicPrivacy,
} from '@/types/music';
import { MOCK_ARTISTS, MOCK_TRACKS, MOCK_PLAYLISTS } from './spotify.service';

const MOCK_NOTES: MusicNote[] = [
  {
    id: 'mn-1',
    userId: 'me',
    text: '🎵 Current obsession: Frank Ocean',
    mood: 'reflective',
    artistName: 'Frank Ocean',
    isHidden: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'mn-2',
    userId: 'me',
    text: '🌙 Late night music hits different',
    trackName: 'I Wanna Be Yours',
    artistName: 'Arctic Monkeys',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
    spotifyUrl: 'https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n',
    mood: 'calm',
    isHidden: false,
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

const MOCK_PROFILE: MusicProfile = {
  userId: 'me',
  spotifyConnected: false,
  topArtists: MOCK_ARTISTS,
  topTracks: MOCK_TRACKS,
  recentlyPlayed: MOCK_TRACKS.slice(0, 3),
  favoriteGenres: ['Indie Rock', 'R&B', 'Alternative', 'Folk'],
  playlists: MOCK_PLAYLISTS,
  currentListening: null,
  songOfTheDay: null,
  privacy: {
    showCurrentlyPlaying: false,
    showTopArtists: true,
    showTopTracks: true,
    showPlaylists: true,
    showMusicChemistry: true,
    allowDiscoverUsers: true,
    allowMatchedUsers: true,
    showVoiceIntro: true,
    voiceIntroMatchesOnly: false,
  },
};

export const musicService = {
  async getMusicProfile(userId: string): Promise<MusicProfile | null> {
    try {
      const { data } = await apiClient.get(endpoints.music.profile(userId));
      return data.data || null;
    } catch {
      return userId === 'me' ? MOCK_PROFILE : null;
    }
  },

  async updateMusicProfile(updates: Partial<MusicProfile> & { selectedPlaylistIds?: string[] }): Promise<void> {
    try {
      await apiClient.put(endpoints.music.updateProfile, updates);
    } catch (err) {
      console.warn('updateMusicProfile error:', err);
    }
  },

  async updatePrivacy(privacy: Partial<MusicPrivacy>): Promise<void> {
    try {
      await apiClient.put(endpoints.music.updateProfile, { privacy });
    } catch (err) {
      console.warn('updatePrivacy error:', err);
    }
  },

  // ─── Notes ──────────────────────────────────────────────────────────────

  async getMyNotes(): Promise<MusicNote[]> {
    try {
      const { data } = await apiClient.get(endpoints.music.notes);
      return data.data || MOCK_NOTES;
    } catch {
      return MOCK_NOTES;
    }
  },

  async getUserNotes(userId: string): Promise<MusicNote[]> {
    try {
      const { data } = await apiClient.get(endpoints.music.userNotes(userId));
      return data.data || [];
    } catch {
      return [];
    }
  },

  async createNote(payload: CreateMusicNotePayload): Promise<MusicNote> {
    const { data } = await apiClient.post(endpoints.music.notes, payload);
    return data.data;
  },

  async updateNote(id: string, updates: Partial<CreateMusicNotePayload>): Promise<MusicNote> {
    const { data } = await apiClient.put(endpoints.music.noteById(id), updates);
    return data.data;
  },

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(endpoints.music.noteById(id));
  },

  // ─── Chemistry & Overlap ────────────────────────────────────────────────

  async getMusicChemistry(userId: string): Promise<MusicChemistry | null> {
    try {
      const { data } = await apiClient.get(endpoints.music.chemistry(userId));
      return data.data || null;
    } catch {
      return null;
    }
  },

  async getMusicOverlap(userId: string): Promise<MusicOverlap | null> {
    try {
      const { data } = await apiClient.get(endpoints.music.overlap(userId));
      return data.data || null;
    } catch {
      return null;
    }
  },

  async getMusicIcebreakers(userId: string): Promise<string[]> {
    try {
      const { data } = await apiClient.get(endpoints.music.icebreakers(userId));
      return data.data || [];
    } catch {
      return [
        "What's your current most-played song?",
        'What album could you listen to front-to-back without skipping?',
        "What's a song you always skip on shuffle but secretly love?",
      ];
    }
  },

  // ─── Voice Intro ────────────────────────────────────────────────────────

  async getVoiceIntro(userId: string): Promise<VoiceIntro | null> {
    try {
      const { data } = await apiClient.get(endpoints.music.voiceIntro(userId));
      return data.data || null;
    } catch {
      return null;
    }
  },

  async uploadVoiceIntro(payload: {
    audioData: string;
    mimeType: string;
    durationSeconds: number;
    isPublic?: boolean;
    matchesOnly?: boolean;
  }): Promise<VoiceIntro> {
    const { data } = await apiClient.post(endpoints.music.uploadVoiceIntro, payload);
    return data.data;
  },

  async deleteVoiceIntro(): Promise<void> {
    await apiClient.delete(endpoints.music.uploadVoiceIntro);
  },
};
