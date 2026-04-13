import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

// ─── Dashboard Stats ──────────────────────────────────────────────────────
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalProducts, totalComments, totalLicenses, totalSubscribers] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.comment.count(),
      db.license.count(),
      db.subscription.count(),
    ]);

    const productsPublished = await db.product.count({ where: { status: 'published' } });
    const commentsApproved = await db.comment.count({ where: { isApproved: true } });
    const licensesActive = await db.license.count({ where: { isActive: true } });

    res.json({
      totalUsers,
      totalProducts,
      productsPublished,
      productsDraft: totalProducts - productsPublished,
      totalComments,
      commentsApproved,
      commentsPending: totalComments - commentsApproved,
      totalLicenses,
      licensesActive,
      totalSubscribers,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(String(days));
    const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const newUsers = await db.user.count({
      where: { createdAt: { gte: startDate } },
    });

    const newProducts = await db.product.count({
      where: { createdAt: { gte: startDate } },
    });

    const newLicenses = await db.license.count({
      where: { createdAt: { gte: startDate } },
    });

    res.json({
      period: { days: daysNum, startDate, endDate: new Date() },
      newUsers,
      newProducts,
      newLicenses,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Users Management ─────────────────────────────────────────────────────
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: String(search), mode: 'insensitive' } },
        { username: { contains: String(search), mode: 'insensitive' } },
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    res.json({
      data: users,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    const user = await db.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const disableUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent disabling yourself
    if (id === (req.user as any).id) {
      throw new ForbiddenError('Cannot disable your own account');
    }

    const user = await db.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, username: true, isActive: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ─── Products Management ──────────────────────────────────────────────────
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { projectName: { contains: String(search), mode: 'insensitive' } },
        { slug: { contains: String(search), mode: 'insensitive' } },
        { projectExplanation: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limitNum,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ]);

    res.json({
      data: products,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectName, slug, projectExplanation, shortDescription, categoryId, videoUrl, thumbnailUrl, storeUrl } = req.body;
    const user = req.user as { id: string; role: string };

    const product = await db.product.create({
      data: {
        projectName,
        slug: slug || projectName.toLowerCase().replace(/\s+/g, '-'),
        projectExplanation,
        shortDescription,
        categoryId,
        videoUrl,
        thumbnailUrl,
        storeUrl,
        createdBy: user.id,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { projectName, slug, projectExplanation, shortDescription, categoryId, videoUrl, thumbnailUrl, storeUrl, status } = req.body;

    const product = await db.product.update({
      where: { id },
      data: {
        projectName,
        slug,
        projectExplanation,
        shortDescription,
        categoryId,
        videoUrl,
        thumbnailUrl,
        storeUrl,
        status,
      },
      include: { category: true },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await db.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const publishProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const product = await db.product.update({
      where: { id },
      data: { status },
      include: { category: true },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ─── Categories Management ────────────────────────────────────────────────
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, colorHex } = req.body;

    const category = await db.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        colorHex,
      },
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, colorHex } = req.body;

    const category = await db.category.update({
      where: { id },
      data: { name, slug, colorHex },
    });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await db.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Comments Moderation ──────────────────────────────────────────────────
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, isApproved } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          product: { select: { id: true, projectName: true } },
          user: { select: { id: true, email: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.comment.count({ where }),
    ]);

    res.json({
      data: comments,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const approveComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const comment = await db.comment.update({
      where: { id },
      data: { isApproved: true },
      include: { product: true, user: true },
    });

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

export const rejectComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await db.comment.delete({ where: { id } });
    res.json({ message: 'Comment rejected and deleted' });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await db.comment.delete({ where: { id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Licenses Management ──────────────────────────────────────────────────
export const getLicenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, isActive, licenseType } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (licenseType) where.licenseType = licenseType;

    const [licenses, total] = await Promise.all([
      db.license.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, email: true, username: true } },
          product: { select: { id: true, projectName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.license.count({ where }),
    ]);

    res.json({
      data: licenses,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const revokeLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const license = await db.license.update({
      where: { id },
      data: { isActive: false },
      include: { user: true, product: true },
    });

    res.json(license);
  } catch (err) {
    next(err);
  }
};

// ─── Subscribers Management ───────────────────────────────────────────────
export const getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, subscriptionType, isActive } = req.query;
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (subscriptionType) where.subscriptionType = subscriptionType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [subscribers, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, email: true, username: true } },
          product: { select: { id: true, projectName: true } },
        },
        orderBy: { subscribedAt: 'desc' },
      }),
      db.subscription.count({ where }),
    ]);

    res.json({
      data: subscribers,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};
