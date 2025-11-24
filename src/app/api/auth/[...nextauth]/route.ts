import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";
import { prisma } from "../../../lib/prisma"; // adjust to your DB setup
import bcrypt from "bcryptjs"; // if passwords are hashed

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Authorize function called with credentials:', credentials);
        if (!credentials) {
          console.log('No credentials provided');
          return null;
        }
        const { email, password } = credentials;
        console.log('Attempting to authorize user:', email);
        // 1. Find user in DB
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          console.log('No user found for email:', email);
          return null; // no user found
        }
        // 2. Check password
        const isValid = await bcrypt.compare(password, user.password); // if hashed
        // const isValid = password === user.password; // if stored plain text (not recommended)
        if (!isValid) {
          console.log('Invalid password for user:', email);
          return null;
        }
        console.log('User authorized successfully:', email);
        // 3. Return user object for session
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };
