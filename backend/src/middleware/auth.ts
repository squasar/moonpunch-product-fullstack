import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { db } from '../config/database';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

    const token   = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await db.user.findUnique({
      where:  { id: payload.userId },
      select: { id: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw new UnauthorizedError('Account not found or disabled');

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    if ((err as any).name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(err);
    }
  }
};
