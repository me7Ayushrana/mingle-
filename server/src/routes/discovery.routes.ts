import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { Like } from '../models/Like';
import { Match } from '../models/Match';
import { Chat } from '../models/Chat';
import { Notification } from '../models/Notification';
import { Block } from '../models/Block';
import { broadcastEvent } from '../socket';

const router = Router();

// GET /discovery/feed - Fetch profiles for discovery/swiping
router.get('/feed', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // 1. Get IDs of users already liked or passed
    const existingInteractions = await Like.find({ fromUserId: currentUserId }).select('toUserId').lean();
    const interactedUserIds = existingInteractions.map((i) => i.toUserId);

    // 2. Get blocked users (both ways)
    const blocks = await Block.find({
      $or: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
    }).lean();
    const blockedUserIds = blocks.map((b) =>
      b.blockerId.toString() === currentUserId ? b.blockedId : b.blockerId
    );

    // Exclude self, already swiped, and blocked
    const excludeIds = [
      new mongoose.Types.ObjectId(currentUserId),
      ...interactedUserIds,
      ...blockedUserIds,
    ];

    // 3. Build query filters based on query params or user preferences
    const ageMin = Number(req.query['ageMin']) || currentUser.preferences?.ageMin || 18;
    const ageMax = Number(req.query['ageMax']) || currentUser.preferences?.ageMax || 60;
    const intention = (req.query['intention'] as string) || '';
    const search = (req.query['search'] as string) || '';

    const query: any = {
      _id: { $nin: excludeIds },
      isOnboarded: true,
      'privacy.incognito': { $ne: true },
    };

    if (ageMin || ageMax) {
      // Query users within acceptable age range (stored as string or default)
      query.$or = [
        { age: { $gte: String(ageMin), $lte: String(ageMax) } },
        { age: { $exists: false } },
      ];
    }

    if (intention && intention !== 'all') {
      query.intention = intention;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { alias: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { interests: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const limit = Number(req.query['limit']) || 20;

    const candidateUsers = await User.find(query)
      .select('-password -email -realIdentity')
      .limit(limit)
      .lean();

    // Map candidate users into standardized Discovery Profile Cards
    const formattedProfiles = candidateUsers.map((u: any) => {
      const photos = Array.isArray(u.photos) && u.photos.length > 0
        ? u.photos
        : [
            {
              id: 'p1',
              url: `https://api.dicebear.com/7.x/bottts/png?seed=${u.avatarId || u.username || u.alias || 'user'}&size=400`,
              isPrimary: true,
              order: 0,
            },
          ];

      const prompts = Array.isArray(u.prompts) && u.prompts.length > 0
        ? u.prompts
        : [
            {
              id: 'pr1',
              promptId: 'vibe_check',
              question: 'A boundary of mine is...',
              answer: 'Kindness, open communication, and good music.',
            },
            {
              id: 'pr2',
              promptId: 'simple_pleasures',
              question: 'My simple pleasures in life...',
              answer: 'Late night lo-fi playlists and stargazing.',
            },
          ];

      return {
        id: u._id.toString(),
        userId: u._id.toString(),
        name: u.name || u.alias || u.username || 'Mingle User',
        username: u.username || `@user`,
        alias: u.alias || u.name || 'User',
        avatarId: u.avatarId || 'avatar-1',
        age: u.age || '22',
        gender: u.gender || 'Not specified',
        pronouns: u.pronouns || '',
        bio: u.bio || 'Exploring connections and good vibes on Mingle.',
        location: u.location || { city: 'San Francisco', country: 'United States' },
        education: u.education || '',
        occupation: u.occupation || '',
        languages: Array.isArray(u.languages) && u.languages.length > 0 ? u.languages : ['English'],
        photos,
        prompts,
        interests: Array.isArray(u.interests) && u.interests.length > 0
          ? u.interests
          : ['Music', 'Coffee', 'Design', 'Travel', 'Art'],
        hobbies: Array.isArray(u.hobbies) ? u.hobbies : [],
        intention: u.intention || 'dating',
        lifestyle: u.lifestyle || {
          drinking: 'Socially',
          smoking: 'Never',
          workout: 'Active',
          pets: 'Dog lover',
          zodiac: '',
        },
        reputation: u.reputation || 85,
        mood: u.mood || 'reflective',
      };
    });

    res.json({
      success: true,
      data: formattedProfiles,
      total: formattedProfiles.length,
    });
  } catch (error) {
    console.error('Discovery feed error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discovery feed' });
  }
});

// POST /discovery/swipe - Submit like, pass, or superlike
router.post('/swipe', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { targetUserId, type, comment, promptId } = req.body;

    if (!currentUserId || !targetUserId || !type) {
      res.status(400).json({ success: false, message: 'Missing targetUserId or swipe type' });
      return;
    }

    if (currentUserId === targetUserId) {
      res.status(400).json({ success: false, message: 'Cannot swipe on yourself' });
      return;
    }

    if (!['like', 'pass', 'superlike'].includes(type)) {
      res.status(400).json({ success: false, message: 'Invalid swipe type' });
      return;
    }

    // 1. Record the like / pass in database (upsert to handle re-tries gracefully)
    await Like.findOneAndUpdate(
      { fromUserId: currentUserId, toUserId: targetUserId },
      { type, comment, promptId },
      { upsert: true, new: true }
    );

    if (type === 'pass') {
      res.json({
        success: true,
        matched: false,
        message: 'Passed profile',
      });
      return;
    }

    // 2. If it's a LIKE or SUPERLIKE, check if target user already liked currentUser
    const reciprocalLike = await Like.findOne({
      fromUserId: targetUserId,
      toUserId: currentUserId,
      type: { $in: ['like', 'superlike'] },
    });

    const currentUser = await User.findById(currentUserId).lean();
    const targetUser = await User.findById(targetUserId).lean();

    if (reciprocalLike) {
      // ─── MUTUAL MATCH! ──────────────────────────────────
      // Check if match record already exists
      let match = await Match.findOne({
        users: { $all: [currentUserId, targetUserId] },
      });

      // Find or create a direct Chat between both users
      let chat = await Chat.findOne({
        participants: { $all: [currentUserId, targetUserId] },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [currentUserId, targetUserId],
          updatedAt: new Date(),
        });
      }

      if (!match) {
        match = await Match.create({
          users: [currentUserId, targetUserId],
          chatId: chat._id,
          status: 'active',
          lastInteraction: new Date(),
        });
      } else {
        match.status = 'active';
        match.chatId = chat._id;
        match.lastInteraction = new Date();
        await match.save();
      }

      // Create notification for target user
      await Notification.create({
        userId: targetUserId,
        type: 'match',
        title: "It's a Match! 🎉",
        message: `You and ${currentUser?.name || currentUser?.alias || 'Someone'} matched!`,
        data: {
          matchId: match._id.toString(),
          chatId: chat._id.toString(),
          fromUserId: currentUserId,
          fromName: currentUser?.name || currentUser?.alias,
          fromAvatarId: currentUser?.avatarId,
        },
      });

      // Create notification for current user
      await Notification.create({
        userId: currentUserId,
        type: 'match',
        title: "It's a Match! 🎉",
        message: `You and ${targetUser?.name || targetUser?.alias || 'Someone'} matched!`,
        data: {
          matchId: match._id.toString(),
          chatId: chat._id.toString(),
          fromUserId: targetUserId,
          fromName: targetUser?.name || targetUser?.alias,
          fromAvatarId: targetUser?.avatarId,
        },
      });

      // Broadcast real-time match event via socket
      broadcastEvent('match:created', {
        matchId: match._id.toString(),
        chatId: chat._id.toString(),
        users: [currentUserId, targetUserId],
      });

      res.json({
        success: true,
        matched: true,
        match: {
          id: match._id.toString(),
          chatId: chat._id.toString(),
          user: {
            id: targetUser?._id.toString(),
            name: targetUser?.name || targetUser?.alias || targetUser?.username,
            avatarId: targetUser?.avatarId || 'avatar-1',
            age: targetUser?.age || '22',
            bio: targetUser?.bio || '',
            photos: targetUser?.photos || [],
          },
        },
        message: "It's a Match!",
      });
      return;
    }

    // 3. Not reciprocal yet — send like notification to target user
    if (targetUser?.notificationPreferences?.likes !== false) {
      await Notification.create({
        userId: targetUserId,
        type: 'like',
        title: 'New Like! ✨',
        message: `${currentUser?.name || currentUser?.alias || 'Someone'} liked your profile.`,
        data: {
          fromUserId: currentUserId,
          fromName: currentUser?.name || currentUser?.alias,
          fromAvatarId: currentUser?.avatarId,
          comment,
        },
      });

      broadcastEvent(`user:${targetUserId}:like`, {
        fromUserId: currentUserId,
        fromName: currentUser?.name || currentUser?.alias,
        fromAvatarId: currentUser?.avatarId,
      });
    }

    res.json({
      success: true,
      matched: false,
      message: 'Like recorded successfully',
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ success: false, message: 'Failed to process swipe' });
  }
});

// POST /discovery/undo - Undo previous action
router.post('/undo', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Find the most recent Like/Pass by this user
    const lastInteraction = await Like.findOne({ fromUserId: currentUserId }).sort({ createdAt: -1 });

    if (!lastInteraction) {
      res.status(400).json({ success: false, message: 'No interactions to undo' });
      return;
    }

    // Delete the like interaction
    await Like.findByIdAndDelete(lastInteraction._id);

    // If it was a match, set match to unmatched
    await Match.findOneAndUpdate(
      { users: { $all: [currentUserId, lastInteraction.toUserId] } },
      { status: 'unmatched', unmatchedBy: currentUserId }
    );

    const undoneProfile = await User.findById(lastInteraction.toUserId).select('-password -email').lean();

    res.json({
      success: true,
      message: 'Undone successfully',
      data: undoneProfile,
    });
  } catch (error) {
    console.error('Undo error:', error);
    res.status(500).json({ success: false, message: 'Failed to undo swipe' });
  }
});

export default router;
