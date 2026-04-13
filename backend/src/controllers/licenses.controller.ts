import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { generateLicenseKey } from '../utils/license-gen';
import { NotFoundError, BadRequestError } from '../utils/errors';

export const myLicenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const licenses = await db.license.findMany({
      where:   { userId: (req.user as { id: string; role: string }).id },
      include: { product: { select: { id: true, projectName: true, slug: true, thumbnailUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(licenses);
  } catch (err) { next(err); }
};

export const generateLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, productId, licenseType, expiresAt } = req.body;
    const licenseKey = generateLicenseKey();
    const license = await db.license.create({
      data: { userId, productId, licenseKey, licenseType: licenseType ?? 'standard', expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    res.status(201).json(license);
  } catch (err) { next(err); }
};

export const activateLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { licenseKey } = req.body;
    const license = await db.license.findUnique({ where: { licenseKey } });
    if (!license) throw new NotFoundError('License key not found');
    if (!license.isActive) throw new BadRequestError('License key is not active');
    if (license.expiresAt && license.expiresAt < new Date()) throw new BadRequestError('License key has expired');

    const updated = await db.license.update({
      where: { id: license.id },
      data:  { userId: (req.user as { id: string; role: string }).id, activatedAt: new Date() },
    });
    res.json(updated);
  } catch (err) { next(err); }
};

export const revokeLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db.license.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'License revoked' });
  } catch (err) { next(err); }
};
