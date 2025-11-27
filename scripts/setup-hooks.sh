#!/bin/bash

echo "🔧 Setting up Git hooks..."

# Make pre-push hook executable
if [ -f ".git/hooks/pre-push" ]; then
  chmod +x .git/hooks/pre-push
  echo "✅ Pre-push hook is now executable"
else
  echo "❌ Pre-push hook not found at .git/hooks/pre-push"
  echo "Creating pre-push hook..."

  cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🔨 Running build before push..."

# Run the build
npm run build

# Capture the exit code
BUILD_EXIT_CODE=$?

# If build failed, prevent push
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ Build failed! Push aborted."
  echo "Please fix the build errors before pushing."
  exit 1
fi

echo "✅ Build successful! Proceeding with push..."
exit 0
EOF

  chmod +x .git/hooks/pre-push
  echo "✅ Pre-push hook created and made executable"
fi

echo ""
echo "✨ Git hooks setup complete!"
echo ""
echo "The pre-push hook will now run 'npm run build' before every push."
echo "To skip the hook (not recommended): git push --no-verify"
echo ""
echo "For more information, see DEVELOPMENT_WORKFLOW.md"
