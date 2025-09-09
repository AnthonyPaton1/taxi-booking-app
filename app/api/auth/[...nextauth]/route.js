import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Always keep email
      if (user?.email) {
        token.email = user.email;
      }

      if (!token.email && user?.email) {
        token.email = user.email;
      }

      // Check DB for this user
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
      });

      // If no user, create one with PUBLIC role
      if (!dbUser && token.email) {
        const newUser = await prisma.user.create({
          data: {
            email: token.email,
            name: user?.name || "",
            image: user?.image || "",
            role: "PUBLIC",
          },
        });
        token.id = newUser.id;
        token.role = newUser.role;
      } else if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
