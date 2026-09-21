export interface PromptCategory {
  id: string;
  name: string;
  prompts: {
    id: string;
    question: string;
    placeholder: string;
  }[];
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'personality',
    name: 'Personality & Vibes',
    prompts: [
      {
        id: 'boundary',
        question: 'A boundary of mine is...',
        placeholder: 'e.g., Respecting downtime, clear communication...',
      },
      {
        id: 'simple_pleasures',
        question: 'My simple pleasures in life...',
        placeholder: 'e.g., Morning pour-over coffee, rain against the window...',
      },
      {
        id: 'geek_out',
        question: 'I can geek out for hours about...',
        placeholder: 'e.g., Sci-fi lore, indie games, music production...',
      },
      {
        id: 'unusual_skill',
        question: 'My most unusual skill is...',
        placeholder: 'e.g., Guessing movie plot twists in the first 5 minutes...',
      },
    ],
  },
  {
    id: 'dating',
    name: 'Dating & Connection',
    prompts: [
      {
        id: 'green_flags',
        question: 'Green flags I look for...',
        placeholder: 'e.g., Emotional self-awareness, makes me laugh...',
      },
      {
        id: 'together_could',
        question: 'Together, we could...',
        placeholder: 'e.g., Try all the hidden taco spots in the city...',
      },
      {
        id: 'ideal_sunday',
        question: 'My ideal Sunday looks like...',
        placeholder: 'e.g., Farmers market, bookstore browse, cooking dinner...',
      },
      {
        id: 'first_round_on_me',
        question: 'The first round is on me if...',
        placeholder: 'e.g., You can beat me at Mario Kart...',
      },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Travel',
    prompts: [
      {
        id: 'bucket_list',
        question: 'Top of my bucket list right now...',
        placeholder: 'e.g., Road trip through the Pacific Northwest...',
      },
      {
        id: 'night_owl_early_bird',
        question: 'Night owl or early bird truth...',
        placeholder: 'e.g., Night owl who wishes they loved 6 AM sunrises...',
      },
      {
        id: 'go_to_snack',
        question: 'My go-to comfort snack...',
        placeholder: 'e.g., Salted dark chocolate, spicy ramen...',
      },
      {
        id: 'soundtrack_life',
        question: 'The soundtrack to my life right now...',
        placeholder: 'e.g., Lo-fi beats, indie synth pop, 90s nostalgia...',
      },
    ],
  },
  {
    id: 'conversation',
    name: 'Conversation Starters',
    prompts: [
      {
        id: 'unpopular_opinion',
        question: 'My most unpopular opinion is...',
        placeholder: 'e.g., Pineapple on pizza is actually amazing...',
      },
      {
        id: 'best_advice',
        question: 'The best advice I ever received...',
        placeholder: 'e.g., You don’t have to attend every argument you’re invited to...',
      },
      {
        id: 'two_truths_one_lie',
        question: 'Two truths and a lie...',
        placeholder: 'e.g., Lived in Japan, met Keanu Reeves, won a chess cup...',
      },
    ],
  },
];

export const ALL_PROMPTS = PROMPT_CATEGORIES.flatMap((c) => c.prompts);
