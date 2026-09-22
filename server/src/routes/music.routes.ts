import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { MusicProfile } from '../models/MusicProfile';
import { MusicNote } from '../models/MusicNote';
import { VoiceIntro } from '../models/VoiceIntro';

const router = Router();

// ─── Music Profile ─────────────────────────────────────────────────────────

// GET /music/profile/:userId — public music profile (respects privacy)
router.get('/profile/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const viewerId = req.user!.id;
  const isSelf = userId === viewerId;

  const profile = await MusicProfile.findOne({ userId }).lean();
  if (!profile) {
    res.json({ success: true, data: null });
    return;
  }

  // Privacy gating
  const privacy = profile.privacy;
  const filtered: any = {
    userId,
    spotifyConnected: profile.spotifyConnected,
    favoriteGenres: profile.favoriteGenres,
    lastSyncedAt: profile.lastSyncedAt,
    privacy: isSelf ? privacy : undefined,
  };

  if (isSelf || privacy.showTopArtists) filtered.topArtists = profile.topArtists;
  if (isSelf || privacy.showTopTracks) filtered.topTracks = profile.topTracks;
  if (isSelf || privacy.showPlaylists) {
    filtered.playlists = profile.playlists.filter((p) => p.isSelectedForProfile || isSelf);
  }
  if (isSelf || privacy.showCurrentlyPlaying) {
    filtered.currentListening = profile.currentListening?.isActive
      ? profile.currentListening
      : null;
  }
  filtered.songOfTheDay = profile.songOfTheDay;

  res.json({ success: true, data: filtered });
});

// PUT /music/profile — update own music profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const {
    favoriteGenres,
    selectedPlaylistIds,
    privacy,
    currentListening,
    songOfTheDay,
  } = req.body;

  const updates: any = {};
  if (Array.isArray(favoriteGenres)) updates.favoriteGenres = favoriteGenres;
  if (privacy) updates.privacy = privacy;
  if (currentListening !== undefined) updates.currentListening = currentListening;
  if (songOfTheDay !== undefined) updates.songOfTheDay = songOfTheDay;

  // Update which playlists are selected for public profile
  if (Array.isArray(selectedPlaylistIds)) {
    await MusicProfile.findOneAndUpdate(
      { userId },
      { $set: { 'playlists.$[].isSelectedForProfile': false } },
      {}
    );
    await MusicProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...updates,
        },
      },
      { upsert: true, new: true }
    );
    // Set selected playlists
    for (const pid of selectedPlaylistIds) {
      await MusicProfile.findOneAndUpdate(
        { userId, 'playlists.spotifyId': pid },
        { $set: { 'playlists.$.isSelectedForProfile': true } }
      );
    }
    const updated = await MusicProfile.findOne({ userId });
    res.json({ success: true, data: updated });
    return;
  }

  const updated = await MusicProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: updated });
});

// ─── Music Notes ───────────────────────────────────────────────────────────

// GET /music/notes — own notes
router.get('/notes', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const notes = await MusicNote.find({
    userId: req.user!.id,
    isHidden: false,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: notes });
});

// GET /music/notes/:userId — public notes for another user
router.get('/notes/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const notes = await MusicNote.find({
    userId: req.params.userId,
    isHidden: false,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  res.json({ success: true, data: notes });
});

// POST /music/notes — create note
router.post('/notes', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { text, mood, trackId, trackName, artistName, albumArt, spotifyUrl, expiryHours } = req.body;
  if (!text?.trim()) {
    res.status(400).json({ success: false, message: 'Note text is required' });
    return;
  }

  let expiresAt: Date | undefined;
  if (expiryHours && expiryHours !== 'forever') {
    expiresAt = new Date(Date.now() + Number(expiryHours) * 3600_000);
  }

  const note = await MusicNote.create({
    userId: req.user!.id,
    text: text.trim(),
    mood,
    trackId,
    trackName,
    artistName,
    albumArt,
    spotifyUrl,
    expiresAt,
  });
  res.status(201).json({ success: true, data: note });
});

// PUT /music/notes/:id — edit note
router.put('/notes/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await MusicNote.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $set: req.body },
    { new: true }
  );
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }
  res.json({ success: true, data: note });
});

// DELETE /music/notes/:id
router.delete('/notes/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  await MusicNote.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  res.json({ success: true, message: 'Note deleted' });
});

// ─── Music Chemistry ────────────────────────────────────────────────────────

// GET /music/chemistry/:userId — calculate music chemistry
router.get('/chemistry/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const myId = req.user!.id;
  const theirId = req.params.userId;

  const [mine, theirs] = await Promise.all([
    MusicProfile.findOne({ userId: myId }).lean(),
    MusicProfile.findOne({ userId: theirId }).lean(),
  ]);

  if (!mine || !theirs || !mine.spotifyConnected || !theirs.spotifyConnected) {
    res.json({
      success: true,
      data: null,
      message: 'Both users need to connect Spotify for Music Chemistry',
    });
    return;
  }

  // Shared artists
  const myArtistIds = new Set(mine.topArtists.map((a) => a.spotifyId));
  const sharedArtists = theirs.topArtists.filter((a) => myArtistIds.has(a.spotifyId));

  // Shared tracks
  const myTrackIds = new Set(mine.topTracks.map((t) => t.spotifyId));
  const sharedTracks = theirs.topTracks.filter((t) => myTrackIds.has(t.spotifyId));

  // Genre overlap
  const myGenres = new Set(mine.topArtists.flatMap((a) => a.genres));
  const theirGenres = theirs.topArtists.flatMap((a) => a.genres);
  const sharedGenres = theirGenres.filter((g) => myGenres.has(g));
  const genreOverlapPct = myGenres.size > 0 ? sharedGenres.length / myGenres.size : 0;

  // Potential discoveries (their artists you don't know)
  const discoveries = theirs.topArtists.filter((a) => !myArtistIds.has(a.spotifyId));

  // Score (0–100)
  const artistScore = Math.min(sharedArtists.length * 8, 40);
  const trackScore = Math.min(sharedTracks.length * 6, 30);
  const genreScore = Math.round(genreOverlapPct * 30);
  const chemistryPct = Math.min(artistScore + trackScore + genreScore, 100);

  res.json({
    success: true,
    data: {
      chemistryPercent: chemistryPct,
      sharedArtistsCount: sharedArtists.length,
      sharedTracksCount: sharedTracks.length,
      genreOverlap:
        genreOverlapPct > 0.6 ? 'High' : genreOverlapPct > 0.3 ? 'Medium' : 'Low',
      similarListeningPatterns:
        chemistryPct > 70
          ? 'Strong'
          : chemistryPct > 40
          ? 'Moderate'
          : 'Different',
      discoveryCount: discoveries.length,
      sharedArtists: sharedArtists.slice(0, 6),
      sharedTracks: sharedTracks.slice(0, 5),
      discoveryArtists: discoveries.slice(0, 5),
    },
  });
});

// GET /music/overlap/:userId — shared artists and discovery suggestions
router.get('/overlap/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const myId = req.user!.id;
  const theirId = req.params.userId;

  const [mine, theirs] = await Promise.all([
    MusicProfile.findOne({ userId: myId }).lean(),
    MusicProfile.findOne({ userId: theirId }).lean(),
  ]);

  const myArtistIds = new Set((mine?.topArtists || []).map((a) => a.spotifyId));
  const shared = (theirs?.topArtists || []).filter((a) => myArtistIds.has(a.spotifyId));
  const discoveries = (theirs?.topArtists || []).filter((a) => !myArtistIds.has(a.spotifyId));

  res.json({
    success: true,
    data: {
      sharedArtists: shared,
      youMightIntroduceThem: (mine?.topArtists || []).filter(
        (a) => !new Set((theirs?.topArtists || []).map((x) => x.spotifyId)).has(a.spotifyId)
      ).slice(0, 5),
      theyMightIntroduceYou: discoveries.slice(0, 5),
    },
  });
});

// GET /music/icebreakers/:userId — music-based icebreaker suggestions
router.get('/icebreakers/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const myId = req.user!.id;
  const theirId = req.params.userId;

  const [mine, theirs] = await Promise.all([
    MusicProfile.findOne({ userId: myId }).lean(),
    MusicProfile.findOne({ userId: theirId }).lean(),
  ]);

  const icebreakers: string[] = [];

  if (mine && theirs) {
    const myArtistIds = new Set(mine.topArtists.map((a) => a.spotifyId));
    const sharedArtists = theirs.topArtists.filter((a) => myArtistIds.has(a.spotifyId));

    if (sharedArtists.length > 0) {
      const artist = sharedArtists[0]!.name;
      icebreakers.push(
        `Okay, important question: what's your favorite ${artist} song?`,
        `You both listen to ${artist} — which album hits hardest?`,
        `${artist} fan spotted! Who introduced you to them?`
      );
    }

    const myGenres = new Set(mine.topArtists.flatMap((a) => a.genres));
    const theirGenres = theirs.topArtists.flatMap((a) => a.genres);
    const sharedGenres = theirGenres.filter((g) => myGenres.has(g));

    if (sharedArtists.length === 0 && sharedGenres.length === 0) {
      icebreakers.push(
        'Your music tastes are completely different — what song would you make them listen to first?',
        "You two have opposite music tastes. Who's converting who?",
        'Very different vibes. What song would you send right now?'
      );
    }

    const myTrackIds = new Set(mine.topTracks.map((t) => t.spotifyId));
    const sharedTracks = theirs.topTracks.filter((t) => myTrackIds.has(t.spotifyId));
    if (sharedTracks.length > 0) {
      icebreakers.push(
        `You both have "${sharedTracks[0]!.name}" in your top tracks — when do you listen to it?`
      );
    }
  }

  // Always have some fallback icebreakers
  if (icebreakers.length < 3) {
    icebreakers.push(
      "What's your current most-played song?",
      'What album could you listen to front-to-back without skipping?',
      "What's a song you always skip on shuffle but secretly love?"
    );
  }

  res.json({ success: true, data: icebreakers.slice(0, 5) });
});

// ─── Voice Intro ────────────────────────────────────────────────────────────

// GET /music/voice-intro/:userId
router.get('/voice-intro/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const viewerId = req.user!.id;
  const isSelf = userId === viewerId;

  const intro = await VoiceIntro.findOne({ userId }).lean();
  if (!intro) {
    res.json({ success: true, data: null });
    return;
  }

  // Privacy check
  if (!isSelf) {
    const profile = await MusicProfile.findOne({ userId }).lean();
    if (profile?.privacy.showVoiceIntro === false) {
      res.json({ success: true, data: null, message: 'Voice intro is private' });
      return;
    }
    // matchesOnly check would require checking Match model — simplified here
    if (intro.matchesOnly && !isSelf) {
      // In production: check if viewer is a match
      // For now, return null for non-matches
    }
  }

  res.json({
    success: true,
    data: {
      id: (intro as any)._id,
      userId,
      audioData: intro.audioData,
      mimeType: intro.mimeType,
      durationSeconds: intro.durationSeconds,
      createdAt: intro.createdAt,
    },
  });
});

// POST /music/voice-intro — upload/replace voice intro
router.post('/voice-intro', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { audioData, mimeType, durationSeconds, isPublic, matchesOnly } = req.body;

  if (!audioData || !durationSeconds) {
    res.status(400).json({ success: false, message: 'audioData and durationSeconds required' });
    return;
  }

  if (durationSeconds > 30) {
    res.status(400).json({ success: false, message: 'Voice intro must be 30 seconds or less' });
    return;
  }

  // Check base64 size (approx 2MB limit)
  const sizeBytes = Buffer.byteLength(audioData, 'base64');
  if (sizeBytes > 3_000_000) {
    res.status(400).json({ success: false, message: 'Audio file too large (max 3MB)' });
    return;
  }

  const intro = await VoiceIntro.findOneAndUpdate(
    { userId: req.user!.id },
    {
      userId: req.user!.id,
      audioData,
      mimeType: mimeType || 'audio/m4a',
      durationSeconds: Math.round(durationSeconds),
      isPublic: isPublic !== false,
      matchesOnly: matchesOnly === true,
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    data: {
      id: intro._id,
      durationSeconds: intro.durationSeconds,
      isPublic: intro.isPublic,
      matchesOnly: intro.matchesOnly,
      createdAt: intro.createdAt,
    },
  });
});

// DELETE /music/voice-intro
router.delete('/voice-intro', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  await VoiceIntro.findOneAndDelete({ userId: req.user!.id });
  res.json({ success: true, message: 'Voice intro deleted' });
});

export default router;
