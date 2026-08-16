import { Request, Response, NextFunction } from 'express';

const FORBIDDEN_PATTERNS = [
  /\b(hate|racist|slur|kill|dox|harass)\b/i,
];

export const vibeGuard = (req: Request, res: Response, next: NextFunction): void => {
  const content = req.body?.content || req.body?.text || req.body?.details || '';

  if (typeof content === 'string' && content.length > 0) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) {
        res.status(400).json({
          success: false,
          message: 'Content contains inappropriate language violating Mingle community guidelines.',
        });
        return;
      }
    }
  }

  next();
};
