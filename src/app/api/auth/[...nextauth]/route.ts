import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";
import { prisma } from "../../../lib/prisma"; // adjust to your DB setup
import bcrypt from "bcryptjs"; // if passwords are hashed
import { sendOtpEmail } from "../../../lib/email";

// Extend the User type to include role
declare module "next-auth" {
  interface User {
    role?: string;
    emailVerified?: boolean;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      emailVerified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    emailVerified?: boolean;
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

          let dbUser;
          if (existingUser) {
            // Update existing user name but keep emailVerified status
            dbUser = await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name,
              },
            });
          } else {
            // Create new user with Google OAuth - NOT verified yet (needs OTP)
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                password: "", // No password for OAuth users
                role: "user",
                emailVerified: false, // Requires OTP verification
              },
            });
          }

          // Generate and send OTP for verification
          const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

          // Delete any existing OTPs for this email
          await prisma.otp.deleteMany({
            where: { email: user.email },
          });

          // Save OTP to database
          await prisma.otp.create({
            data: {
              email: user.email,
              code: otpCode,
              expiresAt: otpExpiresAt,
            },
          });

          // Send OTP email
          console.log('Sending OTP to Google user:', user.email);
          await sendOtpEmail(user.email, user.name || 'User', otpCode);

          return true;
        } catch (error) {
          console.error("Error in Google sign-in:", error);
          return false;
        }
      }
      return true; // Allow credentials login
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      // Always fetch latest user data from database (including the actual DB id)
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, emailVerified: true },
        });
        if (dbUser) {
          token.dbId = dbUser.id; // Store the actual database ID
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        // Use the database ID instead of Google's sub for OAuth users
        session.user.id = token.dbId || token.sub!;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
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
