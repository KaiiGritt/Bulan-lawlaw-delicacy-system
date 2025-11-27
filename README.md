# Lawlaw Delights - E-Commerce System

An authentic Filipino seafood delicacy marketplace built with Next.js, featuring order tracking, seller management, and recipe sharing.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL database
- Git

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

- 🛒 **E-Commerce**: Product listing, cart, checkout
- 📦 **Order Tracking**: Real-time order status with email notifications
- 👥 **Multi-Role System**: Admin, Seller, and Customer roles
- 💬 **Chat System**: Real-time messaging between buyers and sellers
- 📝 **Recipe Sharing**: Community recipes with ingredients and instructions
- 🎨 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first design
- 🔐 **Authentication**: Email/password and OAuth (Google, WhatsApp)

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

Uses **Prisma ORM** with MySQL:

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## 🔑 Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional - for order tracking notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
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

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Framer Motion
- **Email**: Nodemailer
- **State Management**: React Hooks

## 📦 Recent Features

### Order Tracking System (Latest)
- Real-time order status updates
- Email notifications
- Tracking number integration
- Courier service management
- Complete tracking history timeline

See [ORDER_TRACKING_FEATURE.md](./ORDER_TRACKING_FEATURE.md) for details.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the Lawlaw Delights team

---

**Remember:** Always run `npm run build` before pushing (done automatically by git hook)!
