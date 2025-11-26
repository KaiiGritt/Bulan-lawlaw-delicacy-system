# Google OAuth & WhatsApp OTP Authentication Setup

## Overview
Successfully implemented Google OAuth login and WhatsApp OTP authentication to replace GitHub login.

---

## 1. Google OAuth Login

### Changes Made:

#### NextAuth Configuration (`src/app/api/auth/[...nextauth]/route.ts`)
- Added `GoogleProvider` from `next-auth/providers/google`
- Implemented `signIn` callback to handle Google OAuth users
- Auto-creates/updates users when they sign in with Google
- Google users are automatically verified (no OTP needed)
- Role is fetched from database for OAuth users in JWT callback

### Required Environment Variables:

Add these to your `.env.local` file and deployment platform:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### How to Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

---

## 2. WhatsApp OTP Login

### Changes Made:

#### New Pages:
- **`src/app/whatsapp-login/page.tsx`** - WhatsApp login page with OTP flow

#### New API Routes:
- **`src/app/api/auth/whatsapp/send-otp/route.ts`** - Sends OTP to phone number
- **`src/app/api/auth/whatsapp/verify-otp/route.ts`** - Verifies OTP and creates/logs in user

#### Database Schema Updates (`prisma/schema.prisma`):
- Added `phoneNumber` field to `User` model (unique, optional)
- Created new `WhatsAppOTP` model to store OTPs

#### Login Page Update (`src/app/login/page.tsx`):
- Replaced GitHub button with WhatsApp button
- WhatsApp button links to `/whatsapp-login`
- Made Google button functional with `onClick={() => signIn('google')}`

### Features:

**Phone Number Validation:**
- Accepts Philippines format: `09XXXXXXXXX` or `+639XXXXXXXXX`
- Validates format before sending OTP

**OTP System:**
- 6-digit random OTP
- 10-minute expiration
- Stored in database with phone number
- Development mode shows OTP in console (remove in production)

**User Management:**
- Auto-creates user if phone number doesn't exist
- Uses placeholder email: `{phoneNumber}@whatsapp.user`
- Auto-verifies WhatsApp users
- Updates existing user if found

### Current Status (Development Mode):

**OTP is logged to console** - In the send-otp route, the OTP is logged:
```typescript
console.log(`OTP for ${phoneNumber}: ${otp}`);
```

**To integrate with WhatsApp API** (Production):
You'll need to use a service like:
- **Twilio WhatsApp API**
- **WhatsApp Business API**
- **Other WhatsApp messaging services**

Example with Twilio (add this to `send-otp/route.ts`):
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Your Lawlaw Delights verification code is: ${otp}`,
  from: 'whatsapp:+14155238886', // Twilio WhatsApp number
  to: `whatsapp:${phoneNumber}`
});
```

---

## 3. Database Migration Needed

**IMPORTANT:** Before deploying, you need to apply the database migration:

### Option A: Using Prisma Migrate (Recommended for Development)
```bash
npx prisma migrate dev --name add-whatsapp-google-auth
```

### Option B: Direct SQL (For Production)
Run these SQL commands on your database:

```sql
-- Add phoneNumber column to users table
ALTER TABLE users
ADD COLUMN phoneNumber VARCHAR(191) NULL UNIQUE;

-- Create whatsapp_otp table
CREATE TABLE whatsapp_otp (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  phoneNumber VARCHAR(191) NOT NULL UNIQUE,
  otp VARCHAR(191) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Then regenerate Prisma Client:
```bash
npx prisma generate
```

---

## 4. Testing

### Google OAuth:
1. Set up Google OAuth credentials (see above)
2. Add environment variables
3. Click "Google" button on login page
4. You'll be redirected to Google consent screen
5. After authorization, redirected back to your app
6. User is auto-created/updated in database

### WhatsApp OTP:
1. Go to `/login` and click "WhatsApp" button
2. Enter Philippines phone number (e.g., `09123456789`)
3. Click "Send OTP"
4. **Development:** Check console logs for OTP
5. **Production:** Check your WhatsApp for OTP
6. Enter the 6-digit OTP
7. Click "Verify & Login"
8. Redirected to home page

---

## 5. Deployment Checklist

- [ ] Add `GOOGLE_CLIENT_ID` to environment variables
- [ ] Add `GOOGLE_CLIENT_SECRET` to environment variables
- [ ] Update Google OAuth authorized redirect URIs with production URL
- [ ] Run database migration (add `phoneNumber` column and `whatsapp_otp` table)
- [ ] Integrate WhatsApp API service (Twilio, WhatsApp Business API, etc.)
- [ ] Update `send-otp` route to use real WhatsApp API
- [ ] Remove development OTP logging from console
- [ ] Test both Google and WhatsApp login flows
- [ ] Regenerate Prisma client after migration

---

## 6. Security Notes

**Google OAuth:**
- Uses official NextAuth GoogleProvider
- Secure OAuth 2.0 flow
- Users are auto-verified

**WhatsApp OTP:**
- OTP expires after 10 minutes
- Phone numbers are unique (prevents duplicates)
- OTP is stored securely in database
- Verification status is tracked
- **TODO:** Add rate limiting to prevent OTP spam
- **TODO:** Add maximum retry attempts

---

## 7. User Experience

**Login Page Options:**
1. Email/Password (traditional)
2. Google OAuth (one-click)
3. WhatsApp OTP (phone number)

**Benefits:**
- More login options for users
- No password needed for Google/WhatsApp users
- WhatsApp users in Philippines can login easily
- Google users get instant verification

---

## 8. Known Limitations

1. **WhatsApp OTP:** Currently logs OTP to console (development mode)
   - Need to integrate with WhatsApp API for production

2. **Phone Number Format:** Only supports Philippines format
   - Can be extended to support international formats

3. **Database Migration:** Needs to be manually applied
   - Automated in development with `prisma migrate dev`

---

## Need Help?

**Google OAuth Setup:** https://next-auth.js.org/providers/google
**Twilio WhatsApp API:** https://www.twilio.com/docs/whatsapp
**WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
**Prisma Migrations:** https://www.prisma.io/docs/concepts/components/prisma-migrate
