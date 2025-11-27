# Development Workflow

## Git Workflow with Automatic Build Checks

### Pre-Push Hook
This repository has a **pre-push git hook** that automatically runs `npm run build` before pushing changes to the remote repository.

### How It Works

When you run `git push`, the following happens automatically:

```bash
git push
# 🔨 Running build before push...
# ▲ Next.js 16.0.3 (Turbopack)
# Creating an optimized production build...
# ✓ Compiled successfully
# ✅ Build successful! Proceeding with push...
# Pushing to remote...
```

If the build fails:
```bash
git push
# 🔨 Running build before push...
# Failed to compile.
# ❌ Build failed! Push aborted.
# Please fix the build errors before pushing.
```

### Manual Build & Push Workflow

#### Standard Workflow:
```bash
# 1. Make your changes
git add .

# 2. Commit your changes
git commit -m "feat: Add new feature"

# 3. Push (build runs automatically)
git push
```

#### Manual Build Before Commit:
```bash
# 1. Make your changes

# 2. Run build manually (optional)
npm run build

# 3. Commit and push
git add .
git commit -m "feat: Add new feature"
git push  # Build runs again automatically
```

### Bypassing the Pre-Push Hook

⚠️ **Not recommended**, but if you need to skip the build check:

```bash
git push --no-verify
```

**When to use `--no-verify`:**
- Emergency hotfixes
- Documentation-only changes
- CI/CD will handle the build
- You've already verified the build locally

### Benefits of This Workflow

✅ **Prevents Breaking Changes**
- Build errors are caught before reaching the repository
- Reduces failed CI/CD pipelines
- Team members always pull working code

✅ **Saves Time**
- Catches issues early in development
- Reduces back-and-forth in code reviews
- Fewer "fix build" commits

✅ **Maintains Code Quality**
- TypeScript errors caught immediately
- Import issues detected early
- Missing dependencies identified

### Best Practices

#### 1. Always Fix Build Errors
```bash
# ❌ Bad - Don't skip the hook to push broken code
git push --no-verify

# ✅ Good - Fix the errors first
npm run build  # See the errors
# Fix the errors...
git add .
git commit -m "fix: Resolve build errors"
git push  # Build succeeds
```

#### 2. Run Build During Development
```bash
# Run build periodically while developing
npm run build

# Or use dev mode with hot reload
npm run dev
```

#### 3. Check Build Before Committing Large Changes
```bash
# After making significant changes
npm run build

# If successful, commit and push
git add .
git commit -m "feat: Large feature implementation"
git push
```

### Troubleshooting

#### Hook Not Running
If the pre-push hook isn't running:

```bash
# Check if hook exists
ls -la .git/hooks/pre-push

# Make it executable (Unix/Mac)
chmod +x .git/hooks/pre-push

# On Windows with Git Bash
git update-index --chmod=+x .git/hooks/pre-push
```

#### Build Fails But Code Seems Fine
1. **Clean build directory:**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Update dependencies:**
   ```bash
   npm install
   npm run build
   ```

3. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

#### Hook Runs But Build Doesn't Stop Push
The hook might not be executable. Run:
```bash
chmod +x .git/hooks/pre-push
```

### Additional Git Hooks

You can add more hooks for your workflow:

#### Pre-Commit Hook (Run tests before commit)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "🧪 Running tests before commit..."
npm test
```

#### Commit-Msg Hook (Validate commit messages)
Create `.git/hooks/commit-msg`:
```bash
#!/bin/bash
# Ensure commit message follows conventional commits
# feat:, fix:, docs:, etc.
```

### CI/CD Integration

Even with the pre-push hook, we recommend:
- Running builds in CI/CD pipeline
- Running tests in CI/CD
- Deploying only on successful builds

The pre-push hook is a **first line of defense**, not a replacement for CI/CD.

### Team Setup

For team members to get the pre-push hook:

#### Option 1: Manual (Current)
```bash
# After cloning the repo
chmod +x .git/hooks/pre-push
```

#### Option 2: Automated (Using Husky - Future Enhancement)
```bash
npm install --save-dev husky
npx husky install
npx husky add .git/hooks/pre-push "npm run build"
```

Add to `package.json`:
```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### Common Build Issues

#### 1. TypeScript Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Common fixes:
# - Add missing type imports
# - Fix incorrect types
# - Add type assertions where needed
```

#### 2. Missing Imports
```bash
# Install missing packages
npm install

# Check for unused imports
npm run lint
```

#### 3. Environment Variables
```bash
# Ensure .env.local exists
cp .env.example .env.local

# Check required variables
cat .env.local
```

#### 4. Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

### Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `git push` | Push with automatic build check |
| `git push --no-verify` | Push without build check (not recommended) |
| `chmod +x .git/hooks/pre-push` | Make hook executable |

### Summary

✅ Pre-push hook automatically runs `npm run build`
✅ Prevents pushing broken code
✅ Can be bypassed with `--no-verify` if needed
✅ Works with existing git workflow
✅ No additional commands needed - just `git push`

---

**Remember:** A successful build before push keeps the codebase healthy and the team productive! 🚀
