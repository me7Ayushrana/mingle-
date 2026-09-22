import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { SharedPlaylist } from '../models/SharedPlaylist';
import { Match } from '../models/Match';

const router = Router();

// Helper — verify user is part of a match
async function verifyMatchMember(matchId: string, userId: string): Promise<boolean> {
  const match = await Match.findOne({
    _id: matchId,
    users: userId,
    status: 'active',
  });
  return !!match;
}

// GET /playlists/match/:matchId
router.get('/match/:matchId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const matchId = req.params['matchId'] as string;
  const userId = req.user!.id;

  const isMember = await verifyMatchMember(matchId, userId);
  if (!isMember) {
    res.status(403).json({ success: false, message: 'Not part of this match' });
    return;
  }

  let playlist = await SharedPlaylist.findOne({ matchId: matchId as any }).populate('tracks.addedBy', 'alias avatarId').lean();
  if (!playlist) {
    // Create empty playlist for this match
    const match = await Match.findById(matchId).lean();
    playlist = await SharedPlaylist.create({
      matchId: matchId as any,
      users: (match?.users || []) as any,
      tracks: [],
    });
  }
  res.json({ success: true, data: playlist });
});

// POST /playlists/match/:matchId/tracks — add/suggest a track
router.post('/match/:matchId/tracks', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const matchId = req.params['matchId'] as string;
  const userId = req.user!.id;
  const { spotifyId, trackName, artistName, albumArt, spotifyUrl } = req.body;

  if (!trackName || !artistName || !spotifyUrl) {
    res.status(400).json({ success: false, message: 'Track info required' });
    return;
  }

  const isMember = await verifyMatchMember(matchId, userId);
  if (!isMember) {
    res.status(403).json({ success: false, message: 'Not part of this match' });
    return;
  }

  // Prevent duplicate tracks
  const existing = await SharedPlaylist.findOne({
    matchId: matchId as any,
    'tracks.spotifyId': spotifyId,
  });
  if (existing) {
    res.status(409).json({ success: false, message: 'Track already in playlist' });
    return;
  }

  const playlist = await SharedPlaylist.findOneAndUpdate(
    { matchId: matchId as any },
    {
      $push: {
        tracks: {
          spotifyId: spotifyId || `manual-${Date.now()}`,
          trackName,
          artistName,
          albumArt,
          spotifyUrl,
          addedBy: userId as any,
          votes: [userId as any], // auto-upvote own addition
          suggestedAt: new Date(),
        },
      },
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, data: playlist });
});

// DELETE /playlists/match/:matchId/tracks/:trackId
router.delete(
  '/match/:matchId/tracks/:trackId',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const matchId = req.params['matchId'] as string;
    const trackId = req.params['trackId'] as string;
    const userId = req.user!.id;

    const isMember = await verifyMatchMember(matchId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, message: 'Not part of this match' });
      return;
    }

    await SharedPlaylist.findOneAndUpdate(
      { matchId: matchId as any },
      { $pull: { tracks: { spotifyId: trackId } } }
    );
    res.json({ success: true, message: 'Track removed' });
  }
);

// POST /playlists/match/:matchId/tracks/:trackId/vote
router.post(
  '/match/:matchId/tracks/:trackId/vote',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const matchId = req.params['matchId'] as string;
    const trackId = req.params['trackId'] as string;
    const userId = req.user!.id;

    const isMember = await verifyMatchMember(matchId, userId);
    if (!isMember) {
      res.status(403).json({ success: false, message: 'Not part of this match' });
      return;
    }

    // Toggle vote
    const playlist = await SharedPlaylist.findOne({ matchId: matchId as any });
    const track = playlist?.tracks.find((t) => t.spotifyId === trackId);
    if (!track) {
      res.status(404).json({ success: false, message: 'Track not found' });
      return;
    }

    const hasVoted = track.votes.some((v) => v.toString() === userId);
    const update = hasVoted
      ? { $pull: { 'tracks.$.votes': userId as any } }
      : { $addToSet: { 'tracks.$.votes': userId as any } };

    await SharedPlaylist.findOneAndUpdate({ matchId: matchId as any, 'tracks.spotifyId': trackId }, update);
    res.json({ success: true, voted: !hasVoted });
  }
);

export default router;
