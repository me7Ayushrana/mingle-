import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import type { SharedPlaylist, SpotifyTrack } from '@/types/music';

export const sharedPlaylistService = {
  async getPlaylist(matchId: string): Promise<SharedPlaylist | null> {
    try {
      const { data } = await apiClient.get(endpoints.playlists.forMatch(matchId));
      return data.data || null;
    } catch {
      return null;
    }
  },

  async addTrack(matchId: string, track: {
    spotifyId: string;
    trackName: string;
    artistName: string;
    albumArt?: string;
    spotifyUrl: string;
  }): Promise<SharedPlaylist | null> {
    try {
      const { data } = await apiClient.post(endpoints.playlists.addTrack(matchId), track);
      return data.data;
    } catch (err: any) {
      if (err?.response?.status === 409) {
        throw new Error('Track already in playlist');
      }
      throw err;
    }
  },

  async removeTrack(matchId: string, trackId: string): Promise<void> {
    await apiClient.delete(endpoints.playlists.removeTrack(matchId, trackId));
  },

  async voteTrack(matchId: string, trackId: string): Promise<{ voted: boolean }> {
    const { data } = await apiClient.post(endpoints.playlists.voteTrack(matchId, trackId));
    return { voted: data.voted };
  },
};
