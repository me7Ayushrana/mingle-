import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { VoiceRoom } from '../models/VoiceRoom';
import { User } from '../models/User';

const router = Router();

// GET /voice/rooms (List active voice rooms)
router.get('/rooms', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await VoiceRoom.find({ isLive: true })
      .populate('hostId', 'alias avatarId')
      .populate('participants', 'alias avatarId')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRooms = rooms.map((r: any) => ({
      id: r._id.toString(),
      title: r.title,
      topic: r.topic,
      mood: r.mood,
      hostAlias: r.hostId?.alias || 'Anonymous Host',
      hostAvatarId: r.hostId?.avatarId || 'avatar-1',
      participantsCount: r.participants?.length || 1,
      participants: (r.participants || []).map((p: any) => ({
        id: p._id.toString(),
        alias: p.alias || 'Anonymous',
        avatarId: p.avatarId || 'avatar-1',
      })),
      createdAt: r.createdAt.toISOString(),
    }));

    res.json({ success: true, data: formattedRooms });
  } catch (error) {
    console.error('Fetch voice rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /voice/rooms (Create new voice room)
router.post('/rooms', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, topic, mood } = req.body;
    if (!title) {
      res.status(400).json({ success: false, message: 'Room title is required' });
      return;
    }

    const userDoc = await User.findById(req.user?.id);
    const room = new VoiceRoom({
      title,
      topic,
      mood: mood || 'reflective',
      hostId: req.user?.id,
      participants: [req.user?.id],
      isLive: true,
    });
    await room.save();

    res.status(201).json({
      success: true,
      data: {
        id: room._id.toString(),
        title: room.title,
        topic: room.topic,
        mood: room.mood,
        hostAlias: userDoc?.alias || 'Anonymous Host',
        hostAvatarId: userDoc?.avatarId || 'avatar-1',
        participantsCount: 1,
        participants: [],
        createdAt: room.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create voice room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /voice/rooms/:id/join (Join voice room)
router.post('/rooms/:id/join', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await VoiceRoom.findByIdAndUpdate(
      req.params['id'],
      { $addToSet: { participants: req.user?.id } },
      { new: true }
    );

    if (!room) {
      res.status(404).json({ success: false, message: 'Voice room not found' });
      return;
    }

    res.json({ success: true, data: { roomId: room._id.toString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
