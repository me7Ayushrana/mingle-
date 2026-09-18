export interface IcebreakerQuestion {
  id: string;
  category: 'Deep' | 'Fun' | 'Vulnerability' | 'Creative';
  question: string;
}

export const ICEBREAKER_QUESTIONS: IcebreakerQuestion[] = [
  {
    id: '1',
    category: 'Deep',
    question: 'What is a personal belief or goal you haven’t told anyone about yet?',
  },
  {
    id: '2',
    category: 'Fun',
    question: 'If you could listen to only one song for the rest of the week, what would it be?',
  },
  {
    id: '3',
    category: 'Vulnerability',
    question: 'What’s something that made you feel genuinely happy or peaceful recently?',
  },
  {
    id: '4',
    category: 'Creative',
    question: 'If you could teleport anywhere in the world right now for one hour, where would you go?',
  },
  {
    id: '5',
    category: 'Deep',
    question: 'What is a lesson you learned the hard way that changed how you see things?',
  },
  {
    id: '6',
    category: 'Fun',
    question: 'What’s your ultimate comfort food after a long, exhausting day?',
  },
];
