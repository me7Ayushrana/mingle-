import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { Block } from '../models/Block';
import { Report } from '../models/Report';
import { Match } from '../models/Match';

const router = Router();

// PUT /users/me (Update comprehensive profile)
router.put('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      alias,
      username,
      language,
      mood,
      avatarId,
      gender,
      pronouns,
      dob,
      age,
      bio,
      location,
      education,
      occupation,
      languages,
      photos,
      prompts,
      interests,
      hobbies,
      intention,
      lifestyle,
      preferences,
      privacy,
      notificationPreferences,
    } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (username) {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
      if (existing) {
        res.status(400).json({ success: false, message: 'Username is already taken' });
        return;
      }
      user.username = cleanUsername;
    }

    if (name !== undefined) user.name = name;
    if (alias !== undefined) user.alias = alias;
    if (avatarId !== undefined) user.avatarId = avatarId;
    if (gender !== undefined) user.gender = gender;
    if (pronouns !== undefined) user.pronouns = pronouns;
    if (dob !== undefined) user.dob = dob;
    if (age !== undefined) user.age = String(age);
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (occupation !== undefined) user.occupation = occupation;
    if (languages !== undefined) user.languages = languages;
    if (photos !== undefined) user.photos = photos;
    if (prompts !== undefined) user.prompts = prompts;
    if (interests !== undefined) user.interests = interests;
    if (hobbies !== undefined) user.hobbies = hobbies;
    if (intention !== undefined) user.intention = intention;
    if (lifestyle !== undefined) user.lifestyle = { ...user.lifestyle, ...lifestyle };
    if (preferences !== undefined) user.preferences = { ...user.preferences, ...preferences };
    if (privacy !== undefined) user.privacy = { ...user.privacy, ...privacy };
    if (notificationPreferences !== undefined) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
    }
    if (language !== undefined) user.language = language;
    if (mood !== undefined) user.mood = mood;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name || user.alias,
        alias: user.alias,
        avatarId: user.avatarId,
        gender: user.gender,
        pronouns: user.pronouns,
        dob: user.dob,
        age: user.age,
        bio: user.bio,
        location: user.location,
        education: user.education,
        occupation: user.occupation,
        languages: user.languages,
        photos: user.photos,
        prompts: user.prompts,
        interests: user.interests,
        hobbies: user.hobbies,
        intention: user.intention,
        lifestyle: user.lifestyle,
        preferences: user.preferences,
        privacy: user.privacy,
        notificationPreferences: user.notificationPreferences,
        mood: user.mood,
        needs: user.needs,
        reputation: user.reputation,
        badges: user.badges,
        streakDays: user.streakDays,
        createdAt: user.createdAt,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /users/:id/block - Block a user
router.post('/:id/block', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blockerId = req.user?.id;
    const blockedId = req.params['id'];

    if (!blockerId || !blockedId || blockerId === blockedId) {
      res.status(400).json({ success: false, message: 'Invalid block request' });
      return;
    }

    await Block.findOneAndUpdate(
      { blockerId, blockedId },
      { blockerId, blockedId },
      { upsert: true, new: true }
    );

    // Unmatch if currently matched
    await Match.findOneAndUpdate(
      { users: { $all: [blockerId, blockedId] } },
      { status: 'blocked', unmatchedBy: blockerId }
    );

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Failed to block user' });
  }
});

// GET /users/blocked - List blocked users
router.get('/blocked', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const blocks = await Block.find({ blockerId: currentUserId })
      .populate('blockedId', 'name alias username avatarId photos')
      .lean();

    const blockedUsers = blocks.map((b: any) => ({
      id: b._id.toString(),
      user: b.blockedId,
      blockedAt: b.createdAt,
    }));

    res.json({ success: true, data: blockedUsers });
  } catch (error) {
    console.error('Fetch blocked users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blocked users' });
  }
});

// POST /users/:id/unblock - Unblock a user
router.post('/:id/unblock', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blockerId = req.user?.id;
    const blockedId = req.params['id'];

    await Block.findOneAndDelete({ blockerId, blockedId });

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock error:', error);
    res.status(500).json({ success: false, message: 'Failed to unblock user' });
  }
});

// POST /users/:id/report - Report a user
router.post('/:id/report', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reporterId = req.user?.id;
    const reportedUserId = req.params['id'] as string;
    const { reason, details } = req.body;

    if (!reporterId || !reportedUserId || !reason) {
      res.status(400).json({ success: false, message: 'Reason is required for report' });
      return;
    }

    const { default: mongooseObj } = await import('mongoose');
    await Report.create({
      reporterId: new mongooseObj.Types.ObjectId(reporterId),
      reportedUserId: new mongooseObj.Types.ObjectId(reportedUserId),
      reason,
      details,
    });

    res.json({ success: true, message: 'Report submitted. Our moderation team will review it.' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});

// GET /users/active
router.get('/active', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ActiveUser } = await import('../models/ActiveUser');
    const activeUsers = await ActiveUser.find({ userId: { $ne: req.user?.id } })
      .populate('userId', 'alias name username avatarId photos bio mood')
      .lean();

    res.json({ success: true, data: activeUsers });
  } catch (error) {
    console.error('Fetch active users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /users/search
router.get('/search', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query['q'] as string;
    if (!q) {
      res.json({ success: true, data: [] });
      return;
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { alias: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user?.id },
    })
      .select('username alias name avatarId photos mood age bio location intention')
      .limit(10)
      .lean();

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /users/:id - Public profile view
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params['id'])
      .select('-password -email -realIdentity -blockedUsers')
      .lean();

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name || user.alias || user.username,
        username: user.username,
        alias: user.alias,
        avatarId: user.avatarId || 'avatar-1',
        gender: user.gender,
        pronouns: user.pronouns,
        age: user.age,
        bio: user.bio,
        location: user.location,
        education: user.education,
        occupation: user.occupation,
        languages: user.languages,
        photos: user.photos || [],
        prompts: user.prompts || [],
        interests: user.interests || [],
        hobbies: user.hobbies || [],
        intention: user.intention,
        lifestyle: user.lifestyle,
        reputation: user.reputation,
        mood: user.mood,
      },
    });
  } catch (error) {
    console.error('Fetch user profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

export default router;
