import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

/**
 * requireRole('admin') — only allows users with the specified role.
 * requireRole('moderator', 'admin') — allows either role.
 */
export const requireRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes((req.user as { id: string; role: string }).role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
