import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

import connectDB from '@/app/lib/mongodb';
import { User } from '@/app/lib/models/User';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required.');
      }

      await connectDB();

      const normalizedEmail = credentials.email.toLowerCase().trim();
      const user = await User.findOne({ email: normalizedEmail });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password.');
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password.');
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        streak: user.streak,
        notificationPersonality: user.notificationPersonality,
      };
    },
  }),
];

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;

if (githubId && githubSecret) {
  providers.push(
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      // Credentials authentication is already validated in authorize()
      if (account.provider === 'credentials') {
        return true;
      }

      // OAuth providers: GitHub and Google
      if (account.provider === 'github' || account.provider === 'google') {
        if (!user.email) {
          console.warn(`OAuth sign in denied: Missing email from ${account.provider}`);
          return false;
        }

        // Security: Deny OAuth login if Google explicitly marks email as unverified
        if (account.provider === 'google' && profile && (profile as { email_verified?: boolean }).email_verified === false) {
          console.warn('OAuth sign in denied: Unverified Google email address');
          return false;
        }

        await connectDB();

        const normalizedEmail = user.email.toLowerCase().trim();
        let existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
          // Security: Do NOT automatically link OAuth to existing Credentials or different provider accounts
          const isCredentialsUser = Boolean(existingUser.passwordHash) || existingUser.provider === 'credentials';
          const isDifferentProvider = existingUser.provider && existingUser.provider !== account.provider;

          if (isCredentialsUser || isDifferentProvider) {
            console.warn(
              `OAuth account conflict: Account ${normalizedEmail} exists with a different provider. Automatic linking is disabled.`,
            );
            return false;
          }

          // Existing OAuth user with the same provider: allow login and preserve all stats
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.avatar = existingUser.avatar || user.image || '';
          user.xp = existingUser.xp;
          user.coins = existingUser.coins;
          user.level = existingUser.level;
          user.streak = existingUser.streak;
          user.notificationPersonality = existingUser.notificationPersonality;

          return true;
        }

        // New OAuth user: create in MongoDB with schema defaults
        const defaultName =
          user.name || (account.provider === 'github' ? 'GitHub Warrior' : 'Google Warrior');

        try {
          const newUser = await User.create({
            name: defaultName,
            email: normalizedEmail,
            avatar: user.image || '',
            provider: account.provider,
            role: 'Employee',
            xp: 0,
            coins: 0,
            level: 1,
            streak: 0,
            notificationPersonality: 'Friendly',
          });

          user.id = newUser._id.toString();
          user.role = newUser.role;
          user.avatar = newUser.avatar || '';
          user.xp = newUser.xp;
          user.coins = newUser.coins;
          user.level = newUser.level;
          user.streak = newUser.streak;
          user.notificationPersonality = newUser.notificationPersonality;

          return true;
        } catch (createError: unknown) {
          // Handle simultaneous OAuth sign-in race condition (Mongo duplicate key code 11000)
          const isDuplicateKey =
            typeof createError === 'object' &&
            createError !== null &&
            'code' in createError &&
            (createError as { code: number }).code === 11000;

          if (isDuplicateKey) {
            existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser && existingUser.provider === account.provider) {
              user.id = existingUser._id.toString();
              user.role = existingUser.role;
              user.avatar = existingUser.avatar || user.image || '';
              user.xp = existingUser.xp;
              user.coins = existingUser.coins;
              user.level = existingUser.level;
              user.streak = existingUser.streak;
              user.notificationPersonality = existingUser.notificationPersonality;
              return true;
            }
          }

          console.error('Error creating OAuth user:', createError);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar || user.image || '';
        token.xp = user.xp;
        token.coins = user.coins;
        token.level = user.level;
        token.streak = user.streak;
        token.notificationPersonality = user.notificationPersonality;
      }

      // Security: Never blindly trust client-supplied session update values.
      // Always re-fetch verified user data directly from MongoDB Atlas.
      if (trigger === 'update' && token.id) {
        await connectDB();
        const dbUser = await User.findById(token.id).select('-passwordHash');
        if (dbUser) {
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar || '';
          token.xp = dbUser.xp;
          token.coins = dbUser.coins;
          token.level = dbUser.level;
          token.streak = dbUser.streak;
          token.notificationPersonality = dbUser.notificationPersonality;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.xp = token.xp;
        session.user.coins = token.coins;
        session.user.level = token.level;
        session.user.streak = token.streak;
        session.user.notificationPersonality = token.notificationPersonality;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export default handler;
export { handler as auth };
