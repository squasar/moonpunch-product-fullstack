import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subscriptionType = 'newsletter' } = req.body;
    const sub = await db.subscription.upsert({
      where:  { userId_productId_subscriptionType: { userId: (req.user as { id: string; role: string }).id, productId: req.params.productId, subscriptionType } },
      update: { isActive: true, unsubscribedAt: null },
      create: { userId: (req.user as { id: string; role: string }).id, productId: req.params.productId, subscriptionType },
    });
    res.status(201).json(sub);
  } catch (err) { next(err); }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subscriptionType = 'newsletter' } = req.query as Record<string, string>;
    await db.subscription.updateMany({
      where: { userId: (req.user as { id: string; role: string }).id, productId: req.params.productId, subscriptionType: subscriptionType as any },
      data:  { isActive: false, unsubscribedAt: new Date() },
    });
    res.json({ message: 'Unsubscribed' });
  } catch (err) { next(err); }
};

export const mySubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subs = await db.subscription.findMany({
      where:   { userId: (req.user as { id: string; role: string }).id, isActive: true },
      include: { product: { select: { id: true, projectName: true, slug: true, thumbnailUrl: true } } },
      orderBy: { subscribedAt: 'desc' },
    });
    res.json(subs);
  } catch (err) { next(err); }
};

export const productSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subs = await db.subscription.findMany({
      where:   { productId: req.params.productId, isActive: true },
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { subscribedAt: 'desc' },
    });
    res.json({ count: subs.length, subscribers: subs });
  } catch (err) { next(err); }
};
