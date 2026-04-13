import './config/env'; // Validate env vars first — exits if invalid
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/auth';
import { env } from './config/env';
import { AppError } from './utils/errors';

// ─── Routes ────────────────────────────────────────────────────────────────────
import authRoutes        from './routes/auth.routes';
import usersRoutes       from './routes/users.routes';
import productsRoutes    from './routes/products.routes';
import commentsRoutes    from './routes/comments.routes';
import subscribersRoutes from './routes/subscribers.routes';
import licensesRoutes    from './routes/licenses.routes';
import adminRoutes       from './routes/admin.routes';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

//FOR PRODUCTION
/*app.use(cors({
  origin:      env.FRONTEND_URL,
  credentials: true,
}));*/

//FOR DEVELOPMENT ONLY
app.use(cors({
  origin: [env.FRONTEND_URL, 'null'],
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/products',    productsRoutes);
app.use('/api/comments',    commentsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/licenses',    licensesRoutes);

// ─── Root / Health Check ──────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('MOON PUNCH API is running. Use /api/* endpoints.'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Prisma unique constraint violation
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  console.log(`\n🚀  MOON PUNCH API running on http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍  Environment:  ${env.NODE_ENV}\n`);
});

export default app;
