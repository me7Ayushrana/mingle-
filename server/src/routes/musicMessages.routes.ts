import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { MusicMessage } from '../models/MusicMessage';

const router = Router();

// GET /chats/:chatId/music-messages
router.get('/:chatId/music-messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const messages = await MusicMessage.find({ chatId })
    .populate('senderId', 'alias avatarId username')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ success: true, data: messages });
});

// POST /chats/:chatId/music-messages — send a song
router.post('/:chatId/music-messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { spotifyId, trackName, artistName, albumArt, spotifyUrl, message } = req.body;

  if (!trackName || !artistName || !spotifyUrl) {
    res.status(400).json({ success: false, message: 'Track info required' });
    return;
  }

  const musicMsg = await MusicMessage.create({
    chatId: chatId as any,
    senderId: req.user!.id as any,
    spotifyId: spotifyId || `manual-${Date.now()}`,
    trackName,
    artistName,
    albumArt,
    spotifyUrl,
    message,
  });

  const populated = await MusicMessage.findById((musicMsg as any)._id)
    .populate('senderId', 'alias avatarId username')
    .lean();

  res.status(201).json({ success: true, data: populated });
});

// POST /chats/:chatId/music-messages/:id/like — toggle like
router.post(
  '/:chatId/music-messages/:id/like',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.id;
    const msg = await MusicMessage.findById(id);
    if (!msg) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    const hasLiked = msg.likes.some((l) => l.toString() === userId);
    if (hasLiked) {
      msg.likes = msg.likes.filter((l) => l.toString() !== userId);
    } else {
      msg.likes.push(userId as any);
    }
    await msg.save();
    res.json({ success: true, liked: !hasLiked, likesCount: msg.likes.length });
  }
);

export default router;
