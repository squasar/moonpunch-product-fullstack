import { Router } from 'express';
import passport from 'passport';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { register, login, refresh, logout, oauthSuccess, getRedirectUrl, RegisterSchema, LoginSchema } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(RegisterSchema), register);
router.post('/login',    validate(LoginSchema),    login);
router.post('/refresh',  refresh);
router.get('/redirect',  authenticate, getRedirectUrl);
router.post('/logout',   authenticate, logout);

// Google
router.get('/oauth/google',          passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/oauth/callback/google', passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=1' }), oauthSuccess);

// GitHub
router.get('/oauth/github',          passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/oauth/callback/github', passport.authenticate('github', { session: false, failureRedirect: '/login.html?error=1' }), oauthSuccess);

// Steam
router.get('/oauth/steam',           passport.authenticate('steam', { session: false }));
router.get('/oauth/callback/steam',  passport.authenticate('steam', { session: false, failureRedirect: '/login.html?error=1' }), oauthSuccess);

export default router;
