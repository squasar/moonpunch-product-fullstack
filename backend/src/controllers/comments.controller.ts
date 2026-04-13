import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const listComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const comments = await db.comment.findMany({
      where:   { productId, isApproved: true, parentId: null },
      include: { user: { select: { id: true, username: true, avatarUrl: true } }, replies: { where: { isApproved: true }, include: { user: { select: { id: true, username: true, avatarUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (err) { next(err); }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, rating, parentId } = req.body;
    const comment = await db.comment.create({
      data: { productId: req.params.productId, userId: (req.user as { id: string; role: string }).id, content, rating, parentId },
    });
    // Recalculate average rating
    const ratings = await db.comment.aggregate({ where: { productId: req.params.productId, isApproved: true, rating: { not: null } }, _avg: { rating: true } });
    if (ratings._avg.rating) {
      await db.product.update({ where: { id: req.params.productId }, data: { avgRating: ratings._avg.rating } });
    }
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

export const approveComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await db.comment.update({ where: { id: req.params.id }, data: { isApproved: true } });
    res.json(comment);
  } catch (err) { next(err); }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await db.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.userId !== (req.user as { id: string; role: string }).id && (req.user as { id: string; role: string }).role !== 'admin') throw new ForbiddenError();
    await db.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
};
