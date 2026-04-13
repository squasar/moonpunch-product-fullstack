import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, status = 'published', page = '1', limit = '12' } = req.query as Record<string, string>;
    const where: any = {};
    if (status)   where.status = status;
    if (category) where.category = { slug: category };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit),
        orderBy: { releaseDate: 'desc' },
        include: { category: true, _count: { select: { comments: true, subscriptions: true } } },
      }),
      db.product.count({ where }),
    ]);
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await db.product.findUnique({
      where:   { slug: req.params.slug },
      include: { category: true, media: { orderBy: { sortOrder: 'asc' } }, _count: { select: { comments: true, subscriptions: true, licenses: true } } },
    });
    if (!product) throw new NotFoundError('Product not found');
    res.json(product);
  } catch (err) { next(err); }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body, slug: req.body.slug ?? req.body.projectName.toLowerCase().replace(/\s+/g, '-'), createdBy: (req.user as { id: string; role: string }).id };
    const product = await db.product.create({ data, include: { category: true } });
    res.status(201).json(product);
  } catch (err) { next(err); }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await db.product.update({ where: { id: req.params.id }, data: req.body, include: { category: true } });
    res.json(product);
  } catch (err) { next(err); }
};

export const archiveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.product.update({ where: { id: req.params.id }, data: { status: 'archived' } });
    res.json({ message: 'Product archived' });
  } catch (err) { next(err); }
};

export const addMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, mediaType, caption, sortOrder } = req.body;
    const media = await db.productMedia.create({ data: { productId: req.params.id, url, mediaType, caption, sortOrder: sortOrder ?? 0 } });
    res.status(201).json(media);
  } catch (err) { next(err); }
};

export const removeMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.productMedia.delete({ where: { id: req.params.mediaId } });
    res.json({ message: 'Media removed' });
  } catch (err) { next(err); }
};
