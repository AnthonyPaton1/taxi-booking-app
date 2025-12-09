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
    case "HOUSE_STAFF": // NEW
      return "/house/dashboard";
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
        identifier: { label: "Email or Username", type: "text" }, // CHANGED: email → identifier
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

        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const { identifier, password } = credentials;

        // NEW: Determine if identifier is email or username
        const isEmail = identifier.includes("@");

        if (isEmail) {
          // EMAIL LOGIN - Regular users
          const user = await prisma.user.findUnique({
            where: { email: identifier },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
              name: true,
              businessId: true,
              driverOnboarded: true,
              adminOnboarded: true,
            },
          });

          if (!user || !user.password) {
            await simpleRateLimit(
              `failed-login:${ip}:${identifier}`,
              3,
              900
            );
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            await simpleRateLimit(
              `failed-login:${ip}:${identifier}`,
              3,
              900
            );
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            businessId: user.businessId,
            driverOnboarded: user.driverOnboarded,
            adminOnboarded: user.adminOnboarded,
          };
        } else {
          // USERNAME LOGIN - House staff
          const house = await prisma.house.findUnique({
            where: { 
              loginName: identifier,
              deletedAt: null,
            },
            select: {
              id: true,
              loginName: true,
              password: true,
              label: true,
              businessId: true,
            },
          });

          if (!house || !house.password) {
            await simpleRateLimit(
              `failed-login:${ip}:${identifier}`,
              3,
              900
            );
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(password, house.password);
          if (!isValid) {
            await simpleRateLimit(
              `failed-login:${ip}:${identifier}`,
              3,
              900
            );
            throw new Error("Invalid credentials");
          }

          // Return house as "user" object
          return {
            id: `house_${house.id}`, // Prefix to avoid collision with user IDs
            email: null, // House staff don't have email
            role: "HOUSE_STAFF",
            name: house.label,
            businessId: house.businessId,
            houseId: house.id, // Store actual house ID
            driverOnboarded: true, // Not applicable but prevents errors
            adminOnboarded: true, // Not applicable but prevents errors
          };
        }
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
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.businessId = user.businessId;
        token.driverOnboarded = user.driverOnboarded;
        token.adminOnboarded = user.adminOnboarded;
        token.houseId = user.houseId; // NEW: Store houseId for house staff
      }

      // Only fetch from DB on explicit update trigger
      if (trigger === "update" && token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            driverOnboarded: true,
            adminOnboarded: true,
            businessId: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.driverOnboarded = dbUser.driverOnboarded;
          token.adminOnboarded = dbUser.adminOnboarded;
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
        session.user.adminOnboarded = Boolean(token.adminOnboarded);
        session.user.businessId = token.businessId;
        session.user.houseId = token.houseId; // NEW: Available in session
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