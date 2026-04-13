import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where:  { id: (req.user as { id: string; role: string }).id },
      select: { id: true, email: true, username: true, role: true, firstName: true, lastName: true, phone: true, avatarUrl: true, bio: true, isVerified: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User not found');
    res.json(user);
  } catch (err) { next(err); }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone, bio, avatarUrl } = req.body;
    const user = await db.user.update({
      where:  { id: (req.user as { id: string; role: string }).id },
      data:   { firstName, lastName, phone, bio, avatarUrl },
      select: { id: true, email: true, username: true, role: true, firstName: true, lastName: true, phone: true, avatarUrl: true, bio: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where:  { id: req.params.id },
      select: { id: true, username: true, avatarUrl: true, bio: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User not found');
    res.json(user);
  } catch (err) { next(err); }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const [users, total] = await Promise.all([
      db.user.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, username: true, role: true, isActive: true, createdAt: true } }),
      db.user.count(),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const changeRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const user = await db.user.update({ where: { id: req.params.id }, data: { role }, select: { id: true, email: true, role: true } });
    res.json(user);
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === (req.user as { id: string; role: string }).id) throw new ForbiddenError('Cannot disable your own account');
    await db.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'User disabled' });
  } catch (err) { next(err); }
};
