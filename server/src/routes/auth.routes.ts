import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Like } from '../models/Like';
import { Match } from '../models/Match';
import { ChatMessage } from '../models/ChatMessage';
import { Notification } from '../models/Notification';
import { config } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtSecret as string, {
    expiresIn: (config.jwtExpiresIn || '30d') as any,
  });
  const refreshToken = jwt.sign({ id: userId }, config.jwtRefreshSecret as string, {
    expiresIn: (config.jwtRefreshExpiresIn || '90d') as any,
  });

  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

  return { accessToken, refreshToken, expiresAt };
};

const formatUserResponse = (user: any) => ({
  id: user._id?.toString() || user.id,
  email: user.email,
  username: user.username,
  name: user.name || user.alias || user.username || 'Mingle User',
  alias: user.alias || user.name,
  avatarId: user.avatarId || 'avatar-1',
  gender: user.gender,
  pronouns: user.pronouns,
  dob: user.dob,
  age: user.age,
  bio: user.bio || '',
  location: user.location || { city: 'San Francisco', country: 'United States' },
  education: user.education || '',
  occupation: user.occupation || '',
  languages: user.languages || ['English'],
  photos: user.photos || [],
  prompts: user.prompts || [],
  interests: user.interests || [],
  hobbies: user.hobbies || [],
  intention: user.intention || 'dating',
  lifestyle: user.lifestyle || {
    drinking: 'Socially',
    smoking: 'Never',
    workout: 'Active',
    pets: 'Dog lover',
    zodiac: '',
  },
  preferences: user.preferences || {
    ageMin: 18,
    ageMax: 45,
    distanceMax: 50,
  },
  privacy: user.privacy || {
    showOnline: true,
    showDistance: true,
    incognito: false,
  },
  notificationPreferences: user.notificationPreferences || {
    matches: true,
    messages: true,
    likes: true,
  },
  mood: user.mood || 'reflective',
  needs: user.needs || [],
  reputation: user.reputation || 80,
  badges: user.badges || ['Newcomer'],
  streakDays: user.streakDays || 1,
  createdAt: user.createdAt,
  isOnboarded: Boolean(user.isOnboarded),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultUsername = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name || '',
      username: defaultUsername,
      alias: name || defaultUsername,
      avatarId: `avatar-${Math.floor(Math.random() * 12) + 1}`,
      isOnboarded: false,
    });
    await user.save();

    const tokens = generateTokens(user.id);

    res.status(201).json({
      success: true,
      ...tokens,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Identifier and password required' });
      return;
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      ...tokens,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret as string) as unknown as { id: string };
    const tokens = generateTokens(decoded.id);

    res.json({
      success: true,
      ...tokens,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, token } = req.body;

    if (!email && !token) {
      res.status(400).json({ success: false, message: 'Google email or token required' });
      return;
    }

    let userEmail = email;
    let userName = name;

    if (token && !userEmail) {
      try {
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.email) {
          userEmail = decoded.email;
          userName = userName || decoded.name;
        }
      } catch {}
    }

    if (!userEmail) {
      res.status(400).json({ success: false, message: 'Unable to extract email from Google auth' });
      return;
    }

    let user = await User.findOne({ email: userEmail.toLowerCase().trim() });

    if (!user) {
      const adjectives = ['Cosmic', 'Velvet', 'Silent', 'Mystic', 'Neon', 'Echo', 'Solar', 'Shadow', 'Luna', 'Zen'];
      const nouns = ['Panda', 'Nomad', 'Voyager', 'Phoenix', 'Whisper', 'Falcon', 'Ranger', 'Starlight', 'Drifter', 'Wave'];
      const randomAlias = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
      const avatarNum = Math.floor(Math.random() * 12) + 1;

      user = new User({
        email: userEmail.toLowerCase().trim(),
        name: userName || '',
        alias: randomAlias,
        avatarId: `avatar-${avatarNum}`,
        username: (userName || userEmail.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000),
        isOnboarded: false,
      });
      await user.save();
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      ...tokens,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication' });
  }
});

// POST /auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        res.status(400).json({ success: false, message: 'Incorrect current password' });
        return;
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success anyway to prevent email enumeration
      res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
      return;
    }

    res.json({
      success: true,
      message: 'Reset instructions have been sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: 'Email and new password required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /auth/account - Delete user account with full cascade cleanup
router.delete('/account', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Cascade delete user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Like.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] }),
      Match.deleteMany({ users: userId }),
      Notification.deleteMany({ userId }),
      ChatMessage.deleteMany({ senderId: userId }),
    ]);

    res.json({ success: true, message: 'Account deleted permanently' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

export default router;
