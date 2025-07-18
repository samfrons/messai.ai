import NextAuth from 'next-auth';
// import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
// import { prisma } from '../../../../lib/db';

const handler = NextAuth({
  // adapter: PrismaAdapter(prisma) as any, // Temporarily disabled for build
  providers: [
    GitHubProvider({
      clientId: process.env['GITHUB_ID']!,
      clientSecret: process.env['GITHUB_SECRET']!,
    }),
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token['id'] = user['id'];
        token.email = user.email || null;
        token.name = user.name || null;
        token['image'] = user['image'];
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token['id'] as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).image = token['image'] as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    },
    async signOut(message) {
      console.log('User signed out:', message.token?.email);
    },
  },
});

export { handler as GET, handler as POST };
