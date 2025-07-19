import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const getHandler = async () => {
  const { prisma } = await import('@messai/database');

  return NextAuth({
    adapter: PrismaAdapter(prisma),
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
      async signIn(_message) {
        // Log to monitoring service in production
      },
      async signOut(_message) {
        // Log to monitoring service in production
      },
    },
  });
};

const handler = async (req: Request, context: any) => {
  const authHandler = await getHandler();
  return authHandler(req, context);
};

export { handler as GET, handler as POST };
