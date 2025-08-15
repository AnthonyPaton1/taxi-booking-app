import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma } from "@prisma/client";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    /* your providers */
  ],
  callbacks: {
    async session({ session, token }) {
      const userInDb = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (userInDb) {
        session.user.id = userInDb.id;
        session.user.role = userInDb.role;
      }

      return session;
    },
  },
};
