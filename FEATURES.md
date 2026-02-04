# Lawlaw Delights - E-Commerce System Features

**Lawlaw Delights** is an authentic Filipino seafood delicacy marketplace built with Next.js, featuring order tracking, seller management, and recipe sharing.

---

## 👥 Buyer Features
- Browse & purchase Filipino delicacies with detailed information
- Interactive recipe guides with step-by-step instructions
- Save & organize favorite recipes
- Rate products & recipes (5-star system with text reviews)
- Shopping cart & secure checkout
- User profile with order history & favorites
- Email verification (OTP-based)
- Social login (Google, WhatsApp)
- Auto-logout after 30 minutes of inactivity

## 🏪 Seller Features
- Business dashboard for profile & seller application management
- Product inventory management (add/edit/delete with image uploads)
- Mobile-responsive product management interface
- Order tracking & fulfillment
- Respond to customer reviews
- View seller analytics
- Shop as buyer (restricted from own products)

## ⚙️ Admin Features
- Comprehensive dashboard with system analytics
- User account management & moderation
- Seller application approval/rejection
- Product & recipe moderation
- Platform statistics & activity tracking

## 🔐 Security
- Password hashing (bcrypt)
- JWT-based authentication (NextAuth.js)
- CSRF protection
- OTP email verification
- SQL injection prevention (Prisma ORM)
- XSS protection (React built-in)
- Role-based access control
- Ownership validation (prevent self-purchase)

## 📊 Core Features
- Real-time order tracking with email notifications
- Live chat between buyers & sellers
- Dark mode support
- Mobile-first responsive design
- Complete order history and status tracking
- Average ratings calculation & display

## 💻 Tech Stack
**Frontend:** Next.js 14 • TypeScript • Tailwind CSS • Framer Motion  
**Backend:** Node.js • Next.js API Routes  
**Database:** PostgreSQL • Prisma ORM  
**Auth:** NextAuth.js • JWT  
**Email:** Nodemailer • OTP System  
**UI:** Heroicons • Headless UI • React Hot Toast  
**Storage:** Base64 (5MB limit)

## 📦 Database Models
User • SellerApplication • Product • Recipe • Order • Review • Cart • SavedRecipe • FavoriteRecipe • Address • OTP • Announcement • Campaign • ChatMessage

---

*Last updated: February 2026*
