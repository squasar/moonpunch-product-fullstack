import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { emailService, templates } from '../services/email';
import { env } from '../config/env';

// ─── Validation Schemas ───────────────────────────────────────────────────────
export const RegisterSchema = z.object({
  email:    z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const issueTokens = (userId: string, role: string) => ({
  accessToken:  signAccessToken({ userId, role }),
  refreshToken: signRefreshToken({ userId, role }),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing?.email === email)    throw new ConflictError('An account with this email already exists');
    if (existing?.username === username) throw new ConflictError('Username is already taken');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { email, username, passwordHash, firstName, lastName },
    });

    // Send verification email (non-blocking)
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${user.id}`;
    emailService.send({ to: email, ...templates.verifyEmail(verifyUrl) }).catch(console.error);

    const { accessToken, refreshToken } = issueTokens(user.id, user.role);

    // Store refresh token (hashed)
    const hashedRefresh = await bcrypt.hash(refreshToken, 8);
    await db.session.create({
      data: {
        userId:       user.id,
        refreshToken: hashedRefresh,
        ipAddress:    req.ip,
        userAgent:    req.headers['user-agent'],
        expiresAt:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ accessToken, user: { id: user.id, email, username, role: user.role } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Your account has been disabled');

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const { accessToken, refreshToken } = issueTokens(user.id, user.role);
    const hashedRefresh = await bcrypt.hash(refreshToken, 8);

    await db.session.create({
      data: {
        userId:       user.id,
        refreshToken: hashedRefresh,
        ipAddress:    req.ip,
        userAgent:    req.headers['user-agent'],
        expiresAt:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (err) { next(err); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedError('No refresh token');

    const payload = verifyRefreshToken(token);
    const sessions = await db.session.findMany({ where: { userId: payload.userId, expiresAt: { gt: new Date() } } });

    let validSession = null;
    for (const s of sessions) {
      if (await bcrypt.compare(token, s.refreshToken)) { validSession = s; break; }
    }
    if (!validSession) throw new UnauthorizedError('Invalid or expired session');

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedError('User not found');

    const { accessToken, refreshToken: newRefresh } = issueTokens(user.id, user.role);
    const hashedRefresh = await bcrypt.hash(newRefresh, 8);

    await db.session.update({ where: { id: validSession.id }, data: { refreshToken: hashedRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

    res.cookie('refreshToken', newRefresh, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken });
  } catch (err) { next(err); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const payload = verifyRefreshToken(token).userId;
      const sessions = await db.session.findMany({ where: { userId: payload } });
      for (const s of sessions) {
        if (await bcrypt.compare(token, s.refreshToken)) {
          await db.session.delete({ where: { id: s.id } }); break;
        }
      }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const getRedirectUrl = async (req: Request, res: Response) => {
  const user = req.user as { id: string; role: string };
  const redirectUrl = user.role === 'admin' 
    ? '../admin/corona/template/index.html'
    : 'index.html';
  res.json({ redirectUrl });
};

export const oauthSuccess = async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) return res.redirect(`${env.FRONTEND_URL}/login.html?error=oauth_failed`);

  const { accessToken } = issueTokens(user.id, user.role);
  res.redirect(`${env.FRONTEND_URL}/login.html?token=${accessToken}`);
};
