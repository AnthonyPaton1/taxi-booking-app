// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import EmailProvider from "next-auth/providers/email";
import { headers } from "next/headers";
import { simpleRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

function getDashboardByRole(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    case "ADMIN":
      return "/dashboard/admin";
    case "MANAGER":
      return "/dashboard/manager";
    case "COORDINATOR":
      return "/dashboard/coordinator";
    case "DRIVER":
      return "/dashboard/driver";
    case "PUBLIC":
    default:
      return "/dashboard/public";
  }
}

// Helper to get client IP
async function getClientIp() {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown';
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ✅ RATE LIMITING - Check before attempting login
        const ip = await getClientIp();
        const rateLimitResult = await simpleRateLimit(
          `login:${ip}`,
          RATE_LIMITS.auth.maxRequests,
          RATE_LIMITS.auth.windowSeconds
        );

        if (!rateLimitResult.success) {
          throw new Error("Too many login attempts. Please try again in 15 minutes.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            name: true,
            businessId: true,
            driverOnboarded: true,
          },
        });

        if (!user || !user.password) {
          // ✅ Track failed attempt
          await simpleRateLimit(
            `failed-login:${ip}:${credentials.email}`,
            3,
            900 // 15 minutes
          );
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          // ✅ Track failed attempt per email
          await simpleRateLimit(
            `failed-login:${ip}:${credentials.email}`,
            3,
            900
          );
          throw new Error("Invalid credentials");
        }

        // ✅ SUCCESSFUL LOGIN - Return all needed data (including driverOnboarded)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          businessId: user.businessId,
          driverOnboarded: user.driverOnboarded,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 🚀 OPTIMIZATION: On sign in, attach ALL user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessId = user.businessId;
        token.driverOnboarded = user.driverOnboarded;
      }

      // CRITICAL: Only fetch from DB on explicit update trigger
      // This eliminates DB hit on EVERY page load (was causing 3+ sec delays)
      // Token refresh happens automatically via JWT, no DB needed
      if (trigger === "update" && token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            driverOnboarded: true,
            businessId: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.driverOnboarded = dbUser.driverOnboarded;
          token.businessId = dbUser.businessId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.dashboardUrl = getDashboardByRole(token.role);
        session.user.driverOnboarded = Boolean(token.driverOnboarded);
        session.user.businessId = token.businessId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };