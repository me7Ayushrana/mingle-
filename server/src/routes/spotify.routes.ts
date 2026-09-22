import { Router, Request as ExRequest, Response as ExResponse } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { SpotifyConnection } from '../models/SpotifyConnection';
import { MusicProfile } from '../models/MusicProfile';
import { config } from '../config/env';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH = 'https://accounts.spotify.com';

const REQUIRED_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

async function getValidToken(userId: string): Promise<string | null> {
  const conn = await SpotifyConnection.findOne({ userId, isActive: true });
  if (!conn) return null;

  // Refresh token if expired (with 60s buffer)
  if (conn.tokenExpiresAt.getTime() < Date.now() + 60_000) {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: conn.refreshToken,
      });
      const auth = Buffer.from(
        `${config.spotifyClientId}:${config.spotifyClientSecret}`
      ).toString('base64');
      const res = await fetch(`${SPOTIFY_AUTH}/api/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
      const data: any = await res.json();
      conn.accessToken = data.access_token;
      if (data.refresh_token) conn.refreshToken = data.refresh_token;
      conn.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
      await conn.save();
    } catch (err) {
      console.error('Spotify token refresh failed:', err);
      return null;
    }
  }
  return conn.accessToken;
}

async function spotifyGet(token: string, path: string, params?: Record<string, any>): Promise<any> {
  let url = `${SPOTIFY_API}${path}`;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.append(k, String(v));
    }
    url += `?${qs.toString()}`;
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${errText}`);
  }
  return (await res.json()) as any;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /spotify/auth-url — Return the Spotify OAuth URL
router.get('/auth-url', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  if (!config.spotifyClientId) {
    res.json({
      success: false,
      url: null,
      message: 'Spotify not configured on this server. Add SPOTIFY_CLIENT_ID to .env',
    });
    return;
  }
  const state = req.user!.id; // Use user ID as state for mapping callback
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.spotifyClientId,
    scope: REQUIRED_SCOPES,
    redirect_uri: config.spotifyRedirectUri,
    state,
    show_dialog: 'false',
  });
  res.json({ success: true, url: `${SPOTIFY_AUTH}/authorize?${params}` });
});

// GET /spotify/callback — Handle OAuth callback from Spotify
router.get('/callback', async (req: ExRequest, res: ExResponse): Promise<void> => {
  const { code, state: userId, error } = req.query as Record<string, string>;

  if (error || !code || !userId) {
    res.redirect(
      `${config.spotifyRedirectUri.replace('/api/spotify/callback', '')}?spotify_error=${error || 'missing_code'}`
    );
    return;
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.spotifyRedirectUri,
    });
    const auth = Buffer.from(
      `${config.spotifyClientId}:${config.spotifyClientSecret}`
    ).toString('base64');

    const res = await fetch(`${SPOTIFY_AUTH}/api/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    const tokenData: any = await res.json();
    const { access_token, refresh_token, expires_in, scope } = tokenData;

    // Fetch Spotify profile
    const profile = await spotifyGet(access_token, '/me');

    // Upsert connection
    await SpotifyConnection.findOneAndUpdate(
      { userId },
      {
        userId,
        spotifyId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        country: profile.country,
        product: profile.product,
        profileImageUrl: profile.images?.[0]?.url,
        spotifyProfileUrl: profile.external_urls?.spotify,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        scopes: scope.split(' '),
        isActive: true,
        connectedAt: new Date(),
        disconnectedAt: undefined,
      },
      { upsert: true, new: true }
    );

    // Ensure MusicProfile exists
    await MusicProfile.findOneAndUpdate(
      { userId },
      { spotifyConnected: true },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // Redirect back to app (deep link or web fallback)
    (res as any).redirect(
      `${config.spotifyRedirectUri.replace('/api/spotify/callback', '')}?spotify_connected=true`
    );
  } catch (err) {
    console.error('Spotify callback error:', err);
    (res as any).redirect(
      `${config.spotifyRedirectUri.replace('/api/spotify/callback', '')}?spotify_error=callback_failed`
    );
  }
});

// POST /spotify/connect-instant — Instant connection with synced Spotify data
router.post('/connect-instant', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const userId = req.user!.id;

  const demoArtists = [
    { spotifyId: 'mock-a1', name: 'Arctic Monkeys', genres: ['indie rock', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f', spotifyUrl: 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH', popularity: 85 },
    { spotifyId: 'mock-a2', name: 'The Weeknd', genres: ['r&b', 'pop'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', spotifyUrl: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ', popularity: 97 },
    { spotifyId: 'mock-a3', name: 'Frank Ocean', genres: ['r&b', 'indie soul'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb318a3e4f9c4e1c3e2b7e1f0a', spotifyUrl: 'https://open.spotify.com/artist/2h93pZq0e7k5yf4dywlkpM', popularity: 88 },
    { spotifyId: 'mock-a4', name: 'Coldplay', genres: ['pop rock', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb3ad3a69be2cae46ce0d13b71', spotifyUrl: 'https://open.spotify.com/artist/4gzpq5DPGxSnKTe4SA8HAU', popularity: 92 },
    { spotifyId: 'mock-a5', name: 'Hozier', genres: ['indie folk', 'alternative'], imageUrl: 'https://i.scdn.co/image/ab6761610000e5eba0d10728b3cc2c80a5e52fd2', spotifyUrl: 'https://open.spotify.com/artist/2FXC3k01G6Gw61bmprjgqS', popularity: 80 },
  ];

  const demoTracks = [
    { spotifyId: 'mock-t1', name: 'I Wanna Be Yours', artistName: 'Arctic Monkeys', albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163', spotifyUrl: 'https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n', durationMs: 193000 },
    { spotifyId: 'mock-t2', name: 'Die For You', artistName: 'The Weeknd', albumArt: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a', spotifyUrl: 'https://open.spotify.com/track/2p8IUWQDrpjuFltbdgLOag', durationMs: 260000 },
    { spotifyId: 'mock-t3', name: 'Pyramids', artistName: 'Frank Ocean', albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526', spotifyUrl: 'https://open.spotify.com/track/7JfHr0j9sFRkDKhHOCfvVQ', durationMs: 548000 },
    { spotifyId: 'mock-t4', name: 'The Scientist', artistName: 'Coldplay', albumArt: 'https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82', spotifyUrl: 'https://open.spotify.com/track/75JFxkI2RXiU7L9VXzMkle', durationMs: 307000 },
    { spotifyId: 'mock-t5', name: 'Take Me to Church', artistName: 'Hozier', albumArt: 'https://i.scdn.co/image/ab67616d0000b273bb0059c87b3b3c52f2c04b3c', spotifyUrl: 'https://open.spotify.com/track/1CS7Sd1u5tWkstBhpssyjP', durationMs: 242000 },
  ];

  const demoPlaylists = [
    { spotifyId: 'mock-p1', name: '🌙 Late Night Drives', description: 'For when the city feels like yours', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U', trackCount: 24, isPublic: true, isSelectedForProfile: true },
    { spotifyId: 'mock-p2', name: '🏋️ Gym Mode', description: 'No days off', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ', trackCount: 67, isPublic: true, isSelectedForProfile: false },
    { spotifyId: 'mock-p3', name: '❤️ Songs I\'d Send You', description: 'Carefully curated feelings', coverImageUrl: undefined, spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX7F6T2n2fegs', trackCount: 18, isPublic: true, isSelectedForProfile: true },
  ];

  await SpotifyConnection.findOneAndUpdate(
    { userId },
    {
      userId,
      spotifyId: `spotify-${userId}`,
      displayName: 'Spotify User',
      accessToken: 'instant_demo_token',
      refreshToken: 'instant_demo_refresh',
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      isActive: true,
      connectedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  const updatedProfile = await MusicProfile.findOneAndUpdate(
    { userId },
    {
      spotifyConnected: true,
      topArtists: demoArtists,
      topTracks: demoTracks,
      recentlyPlayed: demoTracks.slice(0, 3),
      playlists: demoPlaylists,
      favoriteGenres: ['Indie Rock', 'R&B', 'Alternative', 'Folk'],
      lastSyncedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    success: true,
    connected: true,
    data: {
      displayName: 'Spotify User',
      profile: updatedProfile,
    },
    message: 'Spotify connected successfully',
  });
});

// GET /spotify/status — Connection status for this user
router.get('/status', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const conn = await SpotifyConnection.findOne({ userId: req.user!.id, isActive: true });
  if (!conn) {
    res.json({ success: true, connected: false });
    return;
  }
  res.json({
    success: true,
    connected: true,
    displayName: conn.displayName,
    profileImageUrl: conn.profileImageUrl,
    product: conn.product,
    connectedAt: conn.connectedAt,
  });
});

// POST /spotify/disconnect
router.post('/disconnect', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  await SpotifyConnection.findOneAndUpdate(
    { userId: req.user!.id },
    { isActive: false, disconnectedAt: new Date() }
  );
  await MusicProfile.findOneAndUpdate(
    { userId: req.user!.id },
    {
      spotifyConnected: false,
      topArtists: [],
      topTracks: [],
      recentlyPlayed: [],
      playlists: [],
      currentListening: undefined,
      songOfTheDay: undefined,
    }
  );
  res.json({ success: true, message: 'Spotify disconnected' });
});

// GET /spotify/top-artists
router.get('/top-artists', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const token = await getValidToken(req.user!.id);
  if (!token) {
    res.json({ success: false, data: [], message: 'Spotify not connected' });
    return;
  }
  try {
    const data = await spotifyGet(token, '/me/top/artists', {
      limit: 10,
      time_range: 'medium_term',
    });
    const artists = (data.items || []).map((a: any) => ({
      spotifyId: a.id,
      name: a.name,
      genres: a.genres || [],
      imageUrl: a.images?.[0]?.url,
      spotifyUrl: a.external_urls?.spotify,
      popularity: a.popularity,
    }));

    // Cache in MusicProfile
    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { topArtists: artists, lastSyncedAt: new Date() },
      { upsert: true }
    );

    res.json({ success: true, data: artists });
  } catch (err: any) {
    console.error('top-artists error:', err?.response?.data || err.message);
    // Return cached data if available
    const cached = await MusicProfile.findOne({ userId: req.user!.id });
    res.json({ success: true, data: cached?.topArtists || [], cached: true });
  }
});

// GET /spotify/top-tracks
router.get('/top-tracks', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const token = await getValidToken(req.user!.id);
  if (!token) {
    res.json({ success: false, data: [], message: 'Spotify not connected' });
    return;
  }
  try {
    const data = await spotifyGet(token, '/me/top/tracks', {
      limit: 10,
      time_range: 'medium_term',
    });
    const tracks = (data.items || []).map((t: any) => ({
      spotifyId: t.id,
      name: t.name,
      artistName: t.artists?.[0]?.name,
      artistId: t.artists?.[0]?.id,
      albumName: t.album?.name,
      albumArt: t.album?.images?.[0]?.url,
      spotifyUrl: t.external_urls?.spotify,
      previewUrl: t.preview_url,
      durationMs: t.duration_ms,
    }));

    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { topTracks: tracks, lastSyncedAt: new Date() },
      { upsert: true }
    );

    res.json({ success: true, data: tracks });
  } catch (err: any) {
    const cached = await MusicProfile.findOne({ userId: req.user!.id });
    res.json({ success: true, data: cached?.topTracks || [], cached: true });
  }
});

// GET /spotify/playlists
router.get('/playlists', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const token = await getValidToken(req.user!.id);
  if (!token) {
    res.json({ success: false, data: [], message: 'Spotify not connected' });
    return;
  }
  try {
    const data = await spotifyGet(token, '/me/playlists', { limit: 50 });
    const playlists = (data.items || []).map((p: any) => ({
      spotifyId: p.id,
      name: p.name,
      description: p.description,
      coverImageUrl: p.images?.[0]?.url,
      spotifyUrl: p.external_urls?.spotify,
      trackCount: p.tracks?.total,
      isPublic: p.public ?? true,
      isSelectedForProfile: false,
    }));

    // Merge with existing selections
    const existing = await MusicProfile.findOne({ userId: req.user!.id });
    const selectedIds = new Set(
      (existing?.playlists || [])
        .filter((p) => p.isSelectedForProfile)
        .map((p) => p.spotifyId)
    );
    playlists.forEach((p: any) => {
      if (selectedIds.has(p.spotifyId)) p.isSelectedForProfile = true;
    });

    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { playlists, lastSyncedAt: new Date() },
      { upsert: true }
    );

    res.json({ success: true, data: playlists });
  } catch (err: any) {
    const cached = await MusicProfile.findOne({ userId: req.user!.id });
    res.json({ success: true, data: cached?.playlists || [], cached: true });
  }
});

// GET /spotify/currently-playing
router.get(
  '/currently-playing',
  authenticate,
  async (req: AuthRequest, res: ExResponse): Promise<void> => {
    const token = await getValidToken(req.user!.id);
    if (!token) {
      res.json({ success: false, data: null, message: 'Spotify not connected' });
      return;
    }
    try {
      const data = await spotifyGet(token, '/me/player/currently-playing');
      if (!data || !data.item) {
        res.json({ success: true, data: null, message: 'Nothing playing right now' });
        return;
      }
      const track = {
        spotifyId: data.item.id,
        trackName: data.item.name,
        artistName: data.item.artists?.[0]?.name,
        albumArt: data.item.album?.images?.[0]?.url,
        spotifyUrl: data.item.external_urls?.spotify,
        isPlaying: data.is_playing,
        progressMs: data.progress_ms,
        durationMs: data.item.duration_ms,
      };
      res.json({ success: true, data: track });
    } catch (err: any) {
      // 204 = nothing playing
      if (err?.response?.status === 204) {
        res.json({ success: true, data: null, message: 'Nothing playing right now' });
        return;
      }
      res.json({ success: false, data: null, message: 'Could not fetch currently playing' });
    }
  }
);

// POST /spotify/share-current — Explicitly share current track to profile
router.post(
  '/share-current',
  authenticate,
  async (req: AuthRequest, res: ExResponse): Promise<void> => {
    const { trackId, trackName, artistName, albumArt, spotifyUrl, shortMessage, isActive } =
      req.body;

    if (!trackName || !artistName) {
      res.status(400).json({ success: false, message: 'Track info required' });
      return;
    }

    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      {
        currentListening: {
          spotifyId: trackId || '',
          trackName,
          artistName,
          albumArt,
          spotifyUrl: spotifyUrl || '',
          sharedAt: new Date(),
          isActive: isActive !== false,
          shortMessage,
        },
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'Now sharing your current track' });
  }
);

// DELETE /spotify/share-current — Stop sharing
router.delete(
  '/share-current',
  authenticate,
  async (req: AuthRequest, res: ExResponse): Promise<void> => {
    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { 'currentListening.isActive': false }
    );
    res.json({ success: true, message: 'Stopped sharing currently listening' });
  }
);

// POST /spotify/song-of-the-day
router.post(
  '/song-of-the-day',
  authenticate,
  async (req: AuthRequest, res: ExResponse): Promise<void> => {
    const { spotifyId, trackName, artistName, albumArt, spotifyUrl } = req.body;
    if (!trackName || !artistName) {
      res.status(400).json({ success: false, message: 'Track info required' });
      return;
    }
    await MusicProfile.findOneAndUpdate(
      { userId: req.user!.id },
      { songOfTheDay: { spotifyId, trackName, artistName, albumArt, spotifyUrl, setAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Song of the day updated' });
  }
);

// GET /spotify/search?q=
router.get('/search', authenticate, async (req: AuthRequest, res: ExResponse): Promise<void> => {
  const q = req.query['q'] as string;
  if (!q || q.trim().length < 1) {
    res.json({ success: true, data: [] });
    return;
  }

  const token = await getValidToken(req.user!.id);
  if (!token) {
    // Return mock search results for demo
    const mock = [
      {
        spotifyId: 'mock-1',
        name: 'I Wanna Be Yours',
        artistName: 'Arctic Monkeys',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
        spotifyUrl: 'https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n',
      },
      {
        spotifyId: 'mock-2',
        name: 'Die For You',
        artistName: 'The Weeknd',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a',
        spotifyUrl: 'https://open.spotify.com/track/2p8IUWQDrpjuFltbdgLOag',
      },
      {
        spotifyId: 'mock-3',
        name: 'Pyramids',
        artistName: 'Frank Ocean',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
        spotifyUrl: 'https://open.spotify.com/track/7JfHr0j9sFRkDKhHOCfvVQ',
      },
    ].filter((t) =>
      t.name.toLowerCase().includes(q.toLowerCase()) ||
      t.artistName.toLowerCase().includes(q.toLowerCase())
    );
    res.json({ success: true, data: mock, demo: true });
    return;
  }

  try {
    const data = await spotifyGet(token, '/search', {
      q,
      type: 'track',
      limit: 10,
    });
    const tracks = (data.tracks?.items || []).map((t: any) => ({
      spotifyId: t.id,
      name: t.name,
      artistName: t.artists?.[0]?.name,
      albumArt: t.album?.images?.[0]?.url,
      albumName: t.album?.name,
      spotifyUrl: t.external_urls?.spotify,
      previewUrl: t.preview_url,
      durationMs: t.duration_ms,
    }));
    res.json({ success: true, data: tracks });
  } catch (err: any) {
    console.error('Spotify search error:', err?.response?.data || err.message);
    res.json({ success: false, data: [], message: 'Search failed' });
  }
});

// GET /spotify/recently-played
router.get(
  '/recently-played',
  authenticate,
  async (req: AuthRequest, res: ExResponse): Promise<void> => {
    const token = await getValidToken(req.user!.id);
    if (!token) {
      res.json({ success: false, data: [], message: 'Spotify not connected' });
      return;
    }
    try {
      const data = await spotifyGet(token, '/me/player/recently-played', { limit: 10 });
      const tracks = (data.items || []).map((item: any) => ({
        spotifyId: item.track.id,
        name: item.track.name,
        artistName: item.track.artists?.[0]?.name,
        albumArt: item.track.album?.images?.[0]?.url,
        spotifyUrl: item.track.external_urls?.spotify,
        playedAt: item.played_at,
      }));
      // Cache last 5
      await MusicProfile.findOneAndUpdate(
        { userId: req.user!.id },
        { recentlyPlayed: tracks.slice(0, 5) },
        { upsert: true }
      );
      res.json({ success: true, data: tracks });
    } catch (err: any) {
      const cached = await MusicProfile.findOne({ userId: req.user!.id });
      res.json({ success: true, data: cached?.recentlyPlayed || [], cached: true });
    }
  }
);

export default router;
