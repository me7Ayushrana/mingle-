import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// POST /onboarding/complete
router.post('/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      username,
      alias,
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
      mood,
      needs,
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

    if (name) user.name = name;
    if (alias) user.alias = alias;
    if (avatarId) user.avatarId = avatarId;
    if (gender) user.gender = gender;
    if (pronouns) user.pronouns = pronouns;
    if (dob) user.dob = dob;
    if (age) user.age = String(age);
    if (bio !== undefined) user.bio = bio;
    if (location) user.location = location;
    if (education !== undefined) user.education = education;
    if (occupation !== undefined) user.occupation = occupation;
    if (languages) user.languages = languages;
    if (photos) user.photos = photos;
    if (prompts) user.prompts = prompts;
    if (interests) user.interests = interests;
    if (hobbies) user.hobbies = hobbies;
    if (intention) user.intention = intention;
    if (lifestyle) user.lifestyle = { ...user.lifestyle, ...lifestyle };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (mood) user.mood = mood;
    if (needs) user.needs = needs;

    user.isOnboarded = true;
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
        mood: user.mood,
        needs: user.needs,
        reputation: user.reputation,
        createdAt: user.createdAt,
        isOnboarded: user.isOnboarded,
      },
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    res.status(500).json({ success: false, message: 'Server error during onboarding' });
  }
});

export default router;
