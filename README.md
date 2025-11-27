# Lawlaw Delights - E-Commerce System

An authentic Filipino seafood delicacy marketplace built with Next.js, featuring order tracking, seller management, and recipe sharing.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- PostgreSQL database (local or cloud-hosted)
- Git for version control

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/KaiiGritt/Bulan-lawlaw-delicacy-system.git
cd Bulan-lawlaw-delicacy-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Git hooks:**
```bash
chmod +x scripts/setup-hooks.sh
./scripts/setup-hooks.sh
```

4. **Configure environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

5. **Set up database:**
```bash
npx prisma db push
npx prisma db seed
```

6. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🔨 Development Workflow

### Git Workflow with Automatic Build Checks

This repository uses a **pre-push hook** that automatically runs `npm run build` before pushing changes.

```bash
# Normal workflow - build runs automatically
git add .
git commit -m "feat: Add new feature"
git push  # Build runs automatically before push
```

**If build fails:**
- Fix the build errors
- Commit the fixes
- Try pushing again

**To bypass (not recommended):**
```bash
git push --no-verify
```

📖 **See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for complete workflow documentation**

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## ✨ Features

### For Buyers/Users
- 🛒 **Product Marketplace** - Browse and purchase authentic Filipino delicacies with detailed product information
- 📖 **Interactive Recipe Guides** - Step-by-step cooking instructions with ingredients list
- 💾 **Recipe Collections** - Save and organize favorite recipes for quick access
- ⭐ **Reviews & Ratings** - Rate products and recipes, read community feedback
- 🛍️ **Shopping Cart** - Add multiple items and proceed to secure checkout
- 👤 **User Profile** - Manage personal information, orders, and favorites
- ⏱️ **Session Security** - Auto-logout after 30 minutes of inactivity for enhanced security
- ✉️ **Email Verification** - OTP-based email verification for new accounts
- 🔐 **Social Login** - Sign in with Google or WhatsApp

### For Sellers
- 📊 **Business Dashboard** - Comprehensive dashboard to manage business profile and seller application
- 📦 **Product Inventory** - Add, edit, and delete products with image uploads (mobile-responsive)
- 📈 **Order Management** - Track and fulfill customer orders efficiently
- 💬 **Review Responses** - Reply to customer reviews and engage with feedback
- 📱 **Mobile-Responsive Interface** - Manage business on any device seamlessly
- 🔄 **Dual Role** - Sellers can also shop as buyers (restricted from purchasing own products)

### For Administrators
- 🎛️ **Admin Dashboard** - Comprehensive system management and analytics
- 👥 **User Management** - View, manage, and moderate user accounts
- ✅ **Seller Applications** - Review, approve, or reject seller applications
- 🛡️ **Product Moderation** - Monitor and manage all product listings
- 📋 **Recipe Moderation** - Review and manage recipe submissions
- 📊 **System Analytics** - Track platform statistics and user activity

### Additional Features
- 📦 **Order Tracking**: Real-time order status with email notifications
- 💬 **Chat System**: Real-time messaging between buyers and sellers
- 🎨 **Dark Mode**: Full dark mode support across the entire platform
- 📱 **Responsive Design**: Mobile-first approach, optimized for all screen sizes
- 🔒 **Security**: Industry-standard encryption, JWT sessions, CSRF protection

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities and services
│   │   └── (pages)/          # Next.js app router pages
│   └── middleware.ts          # Auth middleware
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── scripts/
│   └── setup-hooks.sh        # Git hooks setup
├── .git/hooks/
│   └── pre-push              # Pre-push hook (auto-build)
├── DEVELOPMENT_WORKFLOW.md   # Workflow documentation
└── ORDER_TRACKING_FEATURE.md # Order tracking docs
```

## 🗄️ Database

Uses **Prisma ORM** with **PostgreSQL**:

### Main Database Models
- **User** - User accounts (buyers, sellers, admins)
- **SellerApplication** - Seller verification and business information
- **Product** - Product listings with images and details
- **Recipe** - Cooking recipes with step-by-step instructions
- **Order** - Purchase transactions and order history
- **Review** - Product and recipe reviews with ratings and seller replies
- **Cart** - Shopping cart items
- **SavedRecipe** - User's saved recipes collection
- **FavoriteRecipe** - User's favorited recipes

### Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🔑 Environment Variables

Create a `.env` or `.env.local` file in the root directory with the following variables:

```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/lawlaw_db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (for OTP verification and order notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-gmail-app-password"
EMAIL_FROM="noreply@lawlawdelights.com"

# Optional: WhatsApp Integration
WHATSAPP_API_KEY="your-whatsapp-api-key"
```

### How to Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 📚 Documentation

- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Git workflow and build process
- [Order Tracking Feature](./ORDER_TRACKING_FEATURE.md) - Order tracking documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Note:** The pre-push hook will automatically run `npm run build` before pushing. Ensure your build passes!

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **UI Components**: Custom responsive components with Headless UI
- **State Management**: React Hooks (useState, useEffect, useRef)

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Session Management**: JWT tokens
- **Email Service**: Nodemailer

### Additional Libraries & Tools
- **react-hot-toast** - Toast notifications for user feedback
- **bcryptjs** - Password hashing and security
- **@heroicons/react** - Icon library
- **framer-motion** - Smooth animations and transitions
- **next-auth** - Complete authentication solution

## 📦 Recent Features & Updates

### Auto-Logout Security System (Latest)
- **Activity Tracking** - Monitors user activity (mouse, keyboard, scroll, clicks)
- **30-Minute Timeout** - Automatically logs out users after 30 minutes of inactivity
- **2-Minute Warning** - Shows countdown modal before logout
- **Configurable Settings** - Timeout and warning durations can be adjusted
- **Session Security** - Enhances platform security similar to banking websites

### Review & Rating System
- **5-Star Rating** - Product and recipe rating system
- **Text Reviews** - Detailed feedback from users
- **Seller Replies** - Sellers can respond to customer reviews
- **Average Ratings** - Calculated and displayed on products/recipes
- **Review History** - Complete review timeline with timestamps

### Mobile-Responsive Product Inventory
- **Responsive Grid** - 1/2/3 column layout based on screen size
- **Mobile-First Design** - Optimized for mobile devices
- **Touch-Friendly** - Large buttons and easy navigation
- **Product Management** - Add, edit, delete products on any device

### Recipe Integration System
- **API-Driven** - Recipes fetched from database via API
- **Interactive Instructions** - Step-by-step cooking guides
- **Image Upload** - 2MB limit with validation and error handling
- **Share Modal** - Share recipes via social media or copy link
- **Collections** - Save and organize favorite recipes

### Business Information Display
- **Business Details** - Name, address, and seller information on products
- **Buy Now Feature** - Direct checkout from product page
- **Cart Integration** - Seamless add-to-cart and checkout flow
- **Ownership Protection** - Sellers cannot purchase their own products

### Order Tracking System
- Real-time order status updates
- Email notifications
- Tracking number integration
- Courier service management
- Complete tracking history timeline

See [ORDER_TRACKING_FEATURE.md](./ORDER_TRACKING_FEATURE.md) for details.

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds for secure password storage
- **JWT Sessions** - Secure token-based authentication with NextAuth.js
- **Email Verification** - OTP-based account verification system
- **CSRF Protection** - Built-in NextAuth CSRF token protection
- **SQL Injection Prevention** - Prisma ORM with parameterized queries
- **XSS Protection** - React's built-in content escaping
- **Session Timeout** - Auto-logout after 30 minutes of inactivity
- **Ownership Validation** - Users cannot purchase their own products
- **Role-Based Access** - Admin, Seller, and Buyer role separation

## 🌐 Browser Support

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues & Troubleshooting

### Build Errors
If you encounter build errors, try:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database credentials and port (default: 5432)

### Image Upload Issues
- Images must be under 2MB
- Supported formats: JPG, PNG, WebP
- Images are stored as Base64 in database

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team & Contact

Built with ❤️ by the Lawlaw Delights team

- **GitHub Repository**: [Bulan-lawlaw-delicacy-system](https://github.com/KaiiGritt/Bulan-lawlaw-delicacy-system)
- **Report Issues**: [GitHub Issues](https://github.com/KaiiGritt/Bulan-lawlaw-delicacy-system/issues)
- **Email Support**: support@lawlawdelights.com

## 🙏 Acknowledgments

- Inspired by the rich culinary traditions of Bulan, Sorsogon, Philippines
- Built with modern web technologies for optimal performance and user experience
- Designed to empower local Filipino artisan businesses and preserve traditional recipes

---

**Made with 🍤 for authentic Filipino delicacies | Remember:** Always run `npm run build` before pushing (done automatically by git hook)!
