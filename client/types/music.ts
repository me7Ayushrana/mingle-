// ─── Spotify Track / Artist / Playlist ──────────────────────────────────────

export interface SpotifyTrack {
  spotifyId: string;
  name: string;
  artistName: string;
  artistId?: string;
  albumName?: string;
  albumArt?: string;
  spotifyUrl: string;
  previewUrl?: string;
  durationMs?: number;
}

export interface SpotifyArtist {
  spotifyId: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  spotifyUrl: string;
  popularity?: number;
}

export interface SpotifyPlaylist {
  spotifyId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  spotifyUrl: string;
  trackCount?: number;
  isPublic: boolean;
  isSelectedForProfile: boolean;
}

// ─── Currently Listening ─────────────────────────────────────────────────────

export interface CurrentListening {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  sharedAt: string;
  isActive: boolean;
  shortMessage?: string;
}

// ─── Song of the Day ─────────────────────────────────────────────────────────

export interface SongOfTheDay {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  setAt: string;
}

// ─── Music Privacy ───────────────────────────────────────────────────────────

export interface MusicPrivacy {
  showCurrentlyPlaying: boolean;
  showTopArtists: boolean;
  showTopTracks: boolean;
  showPlaylists: boolean;
  showMusicChemistry: boolean;
  allowDiscoverUsers: boolean;
  allowMatchedUsers: boolean;
  showVoiceIntro: boolean;
  voiceIntroMatchesOnly: boolean;
}

// ─── Music Profile ───────────────────────────────────────────────────────────

export interface MusicProfile {
  id?: string;
  userId: string;
  spotifyConnected: boolean;
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  recentlyPlayed?: SpotifyTrack[];
  favoriteGenres: string[];
  playlists: SpotifyPlaylist[];
  currentListening?: CurrentListening | null;
  songOfTheDay?: SongOfTheDay | null;
  privacy: MusicPrivacy;
  lastSyncedAt?: string;
}

// ─── Music Note ──────────────────────────────────────────────────────────────

export interface MusicNote {
  id: string;
  userId: string;
  text: string;
  mood?: string;
  trackId?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  spotifyUrl?: string;
  expiresAt?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMusicNotePayload {
  text: string;
  mood?: string;
  trackId?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  spotifyUrl?: string;
  expiryHours?: number | 'forever';
}

// ─── Voice Intro ─────────────────────────────────────────────────────────────

export interface VoiceIntro {
  id: string;
  userId: string;
  audioData: string; // base64
  mimeType: string;
  durationSeconds: number;
  isPublic: boolean;
  matchesOnly: boolean;
  createdAt: string;
}

// ─── Music Chemistry ─────────────────────────────────────────────────────────

export interface MusicChemistry {
  chemistryPercent: number;
  sharedArtistsCount: number;
  sharedTracksCount: number;
  genreOverlap: 'High' | 'Medium' | 'Low';
  similarListeningPatterns: 'Strong' | 'Moderate' | 'Different';
  discoveryCount: number;
  sharedArtists: SpotifyArtist[];
  sharedTracks: SpotifyTrack[];
  discoveryArtists: SpotifyArtist[];
}

// ─── Music Overlap ───────────────────────────────────────────────────────────

export interface MusicOverlap {
  sharedArtists: SpotifyArtist[];
  youMightIntroduceThem: SpotifyArtist[];
  theyMightIntroduceYou: SpotifyArtist[];
}

// ─── Shared Playlist ─────────────────────────────────────────────────────────

export interface SharedPlaylistTrack {
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  addedBy: { _id: string; alias?: string; avatarId?: string } | string;
  votes: string[];
  suggestedAt: string;
}

export interface SharedPlaylist {
  id: string;
  matchId: string;
  users: string[];
  tracks: SharedPlaylistTrack[];
  spotifyPlaylistId?: string;
  spotifyPlaylistUrl?: string;
  createdAt: string;
}

// ─── Music Message (song sharing in chat) ────────────────────────────────────

export interface MusicMessage {
  id: string;
  chatId: string;
  senderId: string | { _id: string; alias?: string; avatarId?: string };
  spotifyId: string;
  trackName: string;
  artistName: string;
  albumArt?: string;
  spotifyUrl: string;
  message?: string;
  likes: string[];
  createdAt: string;
}

// ─── Spotify Connection Status ───────────────────────────────────────────────

export interface SpotifyStatus {
  connected: boolean;
  displayName?: string;
  profileImageUrl?: string;
  product?: string;
  connectedAt?: string;
}
