import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
     async session({ session, token }) {
      // Add the user's id from token to session
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
