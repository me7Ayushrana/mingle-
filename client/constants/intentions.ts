export interface IntentionOption {
  id: 'dating' | 'friendship' | 'casual' | 'long_term' | 'networking';
  label: string;
  description: string;
  iconName: string;
}

export const INTENTION_OPTIONS: IntentionOption[] = [
  {
    id: 'dating',
    label: 'Dating & Romance',
    description: 'Looking to date and see where things go',
    iconName: 'heart',
  },
  {
    id: 'long_term',
    label: 'Long-term Relationship',
    description: 'Ready for something deep, meaningful & committed',
    iconName: 'sparkles',
  },
  {
    id: 'friendship',
    label: 'New Friends',
    description: 'Expanding my circle with authentic like-minded people',
    iconName: 'people',
  },
  {
    id: 'casual',
    label: 'Casual / Coffee & Chats',
    description: 'Keeping it easy, spontaneous, and fun',
    iconName: 'cafe',
  },
  {
    id: 'networking',
    label: 'Creative Networking',
    description: 'Collaborators, creatives, and ambitious builders',
    iconName: 'bulb',
  },
];

export const LIFESTYLE_OPTIONS = {
  drinking: ['Never', 'Socially', 'Frequently', 'Sober curious'],
  smoking: ['Never', 'Socially', 'Regularly', 'Vape only'],
  workout: ['Daily athlete', '3-4 times a week', 'Casual walks', 'Starting soon'],
  pets: ['Dog lover', 'Cat person', 'Have both', 'No pets', 'Want pets'],
  zodiac: [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ],
};
