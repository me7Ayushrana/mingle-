import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Match } from '../models/Match';
import { Like } from '../models/Like';
import { ChatMessage } from '../models/ChatMessage';
import { Notification } from '../models/Notification';

const router = Router();

// GET /matches - List mutual matches with chat previews
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const matches = await Match.find({
      users: currentUserId,
      status: 'active',
    })
      .populate('users', 'name alias username avatarId age bio photos intention location mood')
      .populate('chatId')
      .sort({ lastInteraction: -1 })
      .lean();

    const formattedMatches = await Promise.all(
      matches.map(async (m: any) => {
        const otherUser = m.users?.find((u: any) => u._id.toString() !== currentUserId);
        if (!otherUser) return null;

        // Fetch last message from this chat if chatId exists
        let lastMessage = null;
        if (m.chatId?._id) {
          lastMessage = await ChatMessage.findOne({ chatId: m.chatId._id })
            .sort({ createdAt: -1 })
            .lean();
        }

        return {
          id: m._id.toString(),
          chatId: m.chatId?._id?.toString() || m.chatId?.toString() || '',
          user: {
            id: otherUser._id.toString(),
            name: otherUser.name || otherUser.alias || otherUser.username,
            username: otherUser.username,
            alias: otherUser.alias,
            avatarId: otherUser.avatarId || 'avatar-1',
            age: otherUser.age || '22',
            bio: otherUser.bio || '',
            photos: otherUser.photos || [],
            location: otherUser.location,
            intention: otherUser.intention,
            mood: otherUser.mood,
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId?.toString(),
              }
            : null,
          matchedAt: m.createdAt,
          lastInteraction: m.lastInteraction,
        };
      })
    );

    const cleanMatches = formattedMatches.filter(Boolean);

    res.json({
      success: true,
      data: cleanMatches,
    });
  } catch (error) {
    console.error('Fetch matches error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch matches' });
  }
});

// GET /matches/likes-received - Profiles that liked the current user
router.get('/likes-received', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // 1. Get likes sent TO current user
    const likes = await Like.find({
      toUserId: currentUserId,
      type: { $in: ['like', 'superlike'] },
    })
      .populate('fromUserId', 'name alias username avatarId age bio photos prompts interests intention location mood')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Filter out profiles current user has already liked/passed/matched with
    const myInteractions = await Like.find({ fromUserId: currentUserId }).select('toUserId').lean();
    const myInteractedUserIds = new Set(myInteractions.map((i) => i.toUserId.toString()));

    const pendingLikes = likes
      .filter((l: any) => l.fromUserId && !myInteractedUserIds.has(l.fromUserId._id.toString()))
      .map((l: any) => ({
        id: l._id.toString(),
        type: l.type,
        comment: l.comment,
        promptId: l.promptId,
        createdAt: l.createdAt,
        user: {
          id: l.fromUserId._id.toString(),
          name: l.fromUserId.name || l.fromUserId.alias || l.fromUserId.username,
          username: l.fromUserId.username,
          alias: l.fromUserId.alias,
          avatarId: l.fromUserId.avatarId || 'avatar-1',
          age: l.fromUserId.age || '22',
          bio: l.fromUserId.bio || '',
          photos: l.fromUserId.photos || [],
          prompts: l.fromUserId.prompts || [],
          interests: l.fromUserId.interests || [],
          intention: l.fromUserId.intention || 'dating',
          location: l.fromUserId.location,
        },
      }));

    res.json({
      success: true,
      data: pendingLikes,
      count: pendingLikes.length,
    });
  } catch (error) {
    console.error('Fetch likes received error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch likes received' });
  }
});

// GET /matches/likes-sent - Likes sent by current user
router.get('/likes-sent', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const likes = await Like.find({
      fromUserId: currentUserId,
      type: { $in: ['like', 'superlike'] },
    })
      .populate('toUserId', 'name alias username avatarId age bio photos intention location')
      .sort({ createdAt: -1 })
      .lean();

    const formattedLikes = likes
      .filter((l: any) => l.toUserId)
      .map((l: any) => ({
        id: l._id.toString(),
        type: l.type,
        comment: l.comment,
        createdAt: l.createdAt,
        user: {
          id: l.toUserId._id.toString(),
          name: l.toUserId.name || l.toUserId.alias || l.toUserId.username,
          username: l.toUserId.username,
          avatarId: l.toUserId.avatarId || 'avatar-1',
          age: l.toUserId.age || '22',
          bio: l.toUserId.bio || '',
          photos: l.toUserId.photos || [],
          intention: l.toUserId.intention,
        },
      }));

    res.json({
      success: true,
      data: formattedLikes,
    });
  } catch (error) {
    console.error('Fetch likes sent error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch likes sent' });
  }
});

// POST /matches/:id/unmatch - Unmatch with a user
router.post('/:id/unmatch', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const matchId = req.params['id'];

    const match = await Match.findOne({
      _id: matchId,
      users: currentUserId,
    });

    if (!match) {
      res.status(404).json({ success: false, message: 'Match not found' });
      return;
    }

    match.status = 'unmatched';
    match.unmatchedBy = new mongoose.Types.ObjectId(currentUserId);
    await match.save();

    res.json({
      success: true,
      message: 'Unmatched successfully',
    });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ success: false, message: 'Failed to unmatch' });
  }
});

// GET /matches/notifications - Get in-app notifications
router.get('/notifications', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const notifications = await Notification.find({ userId: currentUserId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: currentUserId, read: false });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// POST /matches/notifications/read-all - Mark all notifications as read
router.post('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await Notification.updateMany({ userId: currentUserId, read: false }, { read: true });

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Read all notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications read' });
  }
});

export default router;
