import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { db } from './database';
import { env } from './env';

// ─── Google OAuth ─────────────────────────────────────────────────────────────
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL:  env.GOOGLE_CALLBACK_URL ?? '',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), undefined);

          const user = await db.user.upsert({
            where:  { email },
            update: { lastLoginAt: new Date(), avatarUrl: profile.photos?.[0]?.value },
            create: {
              email,
              username:      profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
              oauthProvider: 'google',
              oauthId:       profile.id,
              avatarUrl:     profile.photos?.[0]?.value,
              isVerified:    true,
            },
          });
          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
}

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID:     env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL:  env.GITHUB_CALLBACK_URL ?? '',
        scope:        ['user:email'],
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from GitHub'), undefined);

          const user = await db.user.upsert({
            where:  { email },
            update: { lastLoginAt: new Date(), avatarUrl: profile.photos?.[0]?.value },
            create: {
              email,
              username:      (profile.username ?? profile.displayName ?? 'user') + '_' + Date.now(),
              oauthProvider: 'github',
              oauthId:       profile.id,
              avatarUrl:     profile.photos?.[0]?.value,
              isVerified:    true,
            },
          });
          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
}

// ─── Steam OAuth ──────────────────────────────────────────────────────────────
// Steam does not return an email — users must link their email separately.
// Steam strategy is imported inline to avoid type conflicts.
if (env.STEAM_API_KEY) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SteamStrategy = require('passport-steam').Strategy;
  passport.use(
    new SteamStrategy(
      {
        returnURL: env.STEAM_CALLBACK_URL ?? '',
        realm:     env.FRONTEND_URL ?? 'http://localhost:3000',
        apiKey:    env.STEAM_API_KEY,
      },
      async (_identifier: string, profile: any, done: any) => {
        try {
          const steamId = profile.id as string;

          // Look up by oauthId since Steam gives no email
          let user = await db.user.findFirst({
            where: { oauthProvider: 'steam', oauthId: steamId },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email:         `steam_${steamId}@steam.placeholder`,
                username:      (profile.displayName ?? 'steamuser').replace(/\s+/g, '_') + '_' + Date.now(),
                oauthProvider: 'steam',
                oauthId:       steamId,
                avatarUrl:     profile.photos?.[2]?.value ?? profile.photos?.[0]?.value,
              },
            });
          } else {
            await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
}

export default passport;
