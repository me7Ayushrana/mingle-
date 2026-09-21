export interface InterestCategory {
  category: string;
  items: string[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    category: 'Creative & Arts',
    items: ['Photography', 'Design', 'Painting', 'Architecture', 'Writing', 'Cinema', 'Fashion', 'Theater'],
  },
  {
    category: 'Music & Audio',
    items: ['Indie Rock', 'Electronic', 'Lo-Fi', 'Hip Hop', 'Jazz', 'Vinyl Records', 'Concerts', 'Podcasts'],
  },
  {
    category: 'Activity & Wellness',
    items: ['Hiking', 'Bouldering', 'Yoga', 'Running', 'Cycling', 'Gym & Fitness', 'Meditation', 'Pilates'],
  },
  {
    category: 'Food & Drink',
    items: ['Specialty Coffee', 'Cooking', 'Natural Wine', 'Baking', 'Ramen', 'Plant-Based', 'Matcha', 'Street Food'],
  },
  {
    category: 'Tech & Gaming',
    items: ['Software', 'Indie Games', 'AI & Future', 'PC Gaming', 'Board Games', 'Sci-Fi', 'Crypto', 'Anime'],
  },
  {
    category: 'Travel & Nature',
    items: ['Road Trips', 'Solo Travel', 'Camping', 'National Parks', 'Backpacking', 'Stargazing', 'Beaches', 'Architecture'],
  },
];

export const ALL_INTERESTS = INTEREST_CATEGORIES.flatMap((c) => c.items);
