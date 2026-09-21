import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { env } from '@/config/env';
import type {
  DiscoveryProfile,
  SwipeActionPayload,
  SwipeResponse,
  MatchItem,
  LikeReceivedItem,
} from '@/types/discovery';

export const mockDiscoveryProfiles: DiscoveryProfile[] = [
  {
    id: 'user-disc-1',
    userId: 'user-disc-1',
    name: 'Elena Vance',
    username: 'elenavance',
    alias: 'Elena',
    avatarId: 'avatar-2',
    gender: 'Woman',
    pronouns: 'she/her',
    age: '24',
    bio: 'Product designer by day, indie film & matcha enthusiast by night. Always down for spontaneous road trips.',
    location: { city: 'San Francisco', country: 'CA' },
    education: 'UC Berkeley',
    occupation: 'UI/UX Designer',
    languages: ['English', 'Spanish'],
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 1,
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 2,
      },
    ],
    prompts: [
      {
        id: 'pr1',
        promptId: 'simple_pleasures',
        question: 'My simple pleasures in life...',
        answer: 'Early morning pour-over coffee, curated Spotify playlists, and rainy Sunday reads.',
      },
      {
        id: 'pr2',
        promptId: 'together_could',
        question: 'Together, we could...',
        answer: 'Find the absolute best hidden ramen shop in the city and argue about sci-fi films.',
      },
    ],
    interests: ['Design', 'Specialty Coffee', 'Indie Rock', 'Photography', 'Solo Travel'],
    intention: 'dating',
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: 'Active',
      pets: 'Cat person',
      zodiac: 'Libra',
    },
    reputation: 92,
    mood: 'hopeful',
  },
  {
    id: 'user-disc-2',
    userId: 'user-disc-2',
    name: 'Julian Chen',
    username: 'julianchen',
    alias: 'Julian',
    avatarId: 'avatar-4',
    gender: 'Man',
    pronouns: 'he/him',
    age: '26',
    bio: 'Software engineer building creative tools. Big fan of bouldering, vinyl jazz records, and cooking spicy food.',
    location: { city: 'Oakland', country: 'CA' },
    education: 'Stanford University',
    occupation: 'Full Stack Engineer',
    languages: ['English', 'Mandarin'],
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 1,
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 2,
      },
    ],
    prompts: [
      {
        id: 'pr1',
        promptId: 'geek_out',
        question: 'I can geek out for hours about...',
        answer: 'Audio engineering, analog synthesizers, and why mechanical keyboards are life-changing.',
      },
      {
        id: 'pr2',
        promptId: 'first_round_on_me',
        question: 'The first round is on me if...',
        answer: 'You have a wild travel story or an underrated song recommendation.',
      },
    ],
    interests: ['Bouldering', 'Vinyl Records', 'Cooking', 'AI & Future', 'Hiking'],
    intention: 'long_term',
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: 'Daily athlete',
      pets: 'Dog lover',
      zodiac: 'Gemini',
    },
    reputation: 88,
    mood: 'reflective',
  },
  {
    id: 'user-disc-3',
    userId: 'user-disc-3',
    name: 'Maya Lin',
    username: 'mayalin',
    alias: 'Maya',
    avatarId: 'avatar-5',
    gender: 'Woman',
    pronouns: 'she/her',
    age: '23',
    bio: 'Architectural photographer with an obsession for brutalist concrete and Golden Gate sunsets.',
    location: { city: 'San Francisco', country: 'CA' },
    education: 'RISD',
    occupation: 'Photographer',
    languages: ['English', 'French'],
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 1,
      },
    ],
    prompts: [
      {
        id: 'pr1',
        promptId: 'boundary',
        question: 'A boundary of mine is...',
        answer: 'Honesty over politeness, respecting alone time, and prioritizing genuine mental wellness.',
      },
      {
        id: 'pr2',
        promptId: 'ideal_sunday',
        question: 'My ideal Sunday looks like...',
        answer: '35mm film walk in the Mission, fresh pastries, and reading at Dolores Park.',
      },
    ],
    interests: ['Photography', 'Architecture', 'Natural Wine', 'Cinema', 'Design'],
    intention: 'dating',
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: 'Casual walks',
      pets: 'Have both',
      zodiac: 'Taurus',
    },
    reputation: 95,
    mood: 'calm',
  },
  {
    id: 'user-disc-4',
    userId: 'user-disc-4',
    name: 'Leo Thorne',
    username: 'leothorne',
    alias: 'Leo',
    avatarId: 'avatar-6',
    gender: 'Non-binary',
    pronouns: 'they/them',
    age: '25',
    bio: 'Sound designer & electronic producer. Always searching for good frequencies and genuine people.',
    location: { city: 'Berkeley', country: 'CA' },
    education: 'CalArts',
    occupation: 'Audio Producer',
    languages: ['English'],
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0,
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
        isPrimary: false,
        order: 1,
      },
    ],
    prompts: [
      {
        id: 'pr1',
        promptId: 'unpopular_opinion',
        question: 'My most unpopular opinion is...',
        answer: 'Silences are comfortable when you are with the right person.',
      },
    ],
    interests: ['Electronic', 'Podcasts', 'Lo-Fi', 'Sci-Fi', 'Board Games'],
    intention: 'friendship',
    lifestyle: {
      drinking: 'Sober curious',
      smoking: 'Never',
      workout: 'Yoga',
      pets: 'Dog lover',
      zodiac: 'Aquarius',
    },
    reputation: 86,
    mood: 'excited',
  },
];

let cachedFeed: DiscoveryProfile[] = [...mockDiscoveryProfiles];
let cachedMatches: MatchItem[] = [];
let cachedLikesReceived: LikeReceivedItem[] = [
  {
    id: 'like-rec-1',
    type: 'like',
    comment: 'Loved your prompt answer about pour-over coffee!',
    promptId: 'simple_pleasures',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    user: mockDiscoveryProfiles[0]!,
  },
];

export const discoveryService = {
  async getFeed(filters?: {
    ageMin?: number;
    ageMax?: number;
    intention?: string;
    search?: string;
  }): Promise<DiscoveryProfile[]> {
    if (env.useMockApi) {
      return cachedFeed;
    }
    try {
      const { data } = await apiClient.get(endpoints.discovery.feed, { params: filters });
      if (Array.isArray(data?.data) && data.data.length > 0) {
        cachedFeed = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn('discovery feed fallback:', err);
    }
    return cachedFeed;
  },

  async swipe(payload: SwipeActionPayload): Promise<SwipeResponse> {
    // Remove swiped card from cached feed
    cachedFeed = cachedFeed.filter((p) => p.id !== payload.targetUserId && p.userId !== payload.targetUserId);

    if (!env.useMockApi) {
      try {
        const { data } = await apiClient.post(endpoints.discovery.swipe, payload);
        if (data?.matched && data?.match) {
          cachedMatches = [data.match, ...cachedMatches];
        }
        return data;
      } catch (err) {
        console.warn('swipe fallback:', err);
      }
    }

    // Demo fallback matching simulation: if swiping right on first demo profile, trigger match!
    if (payload.type === 'like' || payload.type === 'superlike') {
      const targetUser = mockDiscoveryProfiles.find((p) => p.id === payload.targetUserId);
      if (targetUser && (payload.targetUserId === 'user-disc-1' || Math.random() > 0.4)) {
        const demoMatch: MatchItem = {
          id: `match-${Date.now()}`,
          chatId: 'demo-chat-1',
          user: {
            id: targetUser.id,
            name: targetUser.name,
            alias: targetUser.alias,
            username: targetUser.username,
            avatarId: targetUser.avatarId,
            age: targetUser.age,
            bio: targetUser.bio,
            photos: targetUser.photos,
            location: targetUser.location,
            intention: targetUser.intention,
            mood: targetUser.mood,
          },
          matchedAt: new Date().toISOString(),
          lastInteraction: new Date().toISOString(),
        };
        cachedMatches = [demoMatch, ...cachedMatches];
        return {
          success: true,
          matched: true,
          match: {
            id: demoMatch.id,
            chatId: demoMatch.chatId,
            user: {
              id: targetUser.id,
              name: targetUser.name,
              avatarId: targetUser.avatarId,
              age: targetUser.age,
              bio: targetUser.bio,
              photos: targetUser.photos,
            },
          },
        };
      }
    }

    return { success: true, matched: false };
  },

  async undo(): Promise<{ success: boolean; data?: DiscoveryProfile }> {
    if (!env.useMockApi) {
      try {
        const { data } = await apiClient.post(endpoints.discovery.undo);
        return data;
      } catch (err) {
        console.warn('undo fallback:', err);
      }
    }
    return { success: true };
  },

  async getMatches(): Promise<MatchItem[]> {
    if (env.useMockApi) {
      return cachedMatches;
    }
    try {
      const { data } = await apiClient.get(endpoints.matches.list);
      if (Array.isArray(data?.data)) {
        cachedMatches = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn('getMatches fallback:', err);
    }
    return cachedMatches;
  },

  async getLikesReceived(): Promise<LikeReceivedItem[]> {
    if (env.useMockApi) {
      return cachedLikesReceived;
    }
    try {
      const { data } = await apiClient.get(endpoints.matches.likesReceived);
      if (Array.isArray(data?.data)) {
        cachedLikesReceived = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn('getLikesReceived fallback:', err);
    }
    return cachedLikesReceived;
  },

  async unmatch(matchId: string): Promise<boolean> {
    cachedMatches = cachedMatches.filter((m) => m.id !== matchId);
    if (!env.useMockApi) {
      try {
        await apiClient.post(endpoints.matches.unmatch(matchId));
        return true;
      } catch (err) {
        console.warn('unmatch fallback:', err);
      }
    }
    return true;
  },
};
