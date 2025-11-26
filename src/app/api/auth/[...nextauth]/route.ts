import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";
import { prisma } from "../../../lib/prisma"; // adjust to your DB setup
import bcrypt from "bcryptjs"; // if passwords are hashed

// Extend the User type to include role
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // Update existing user
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name,
                emailVerified: true, // Google users are auto-verified
              },
            });
          } else {
            // Create new user with Google OAuth
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                password: "", // No password for OAuth users
                role: "user",
                emailVerified: true, // Google users are auto-verified
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error in Google sign-in:", error);
          return false;
        }
      }
      return true; // Allow credentials login
    },
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      if (user) {
        token.role = user.role;
      } else if (token.email) {
        // Fetch role from database for OAuth users
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };
