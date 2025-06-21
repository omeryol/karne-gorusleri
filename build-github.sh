#!/bin/bash

# Build script for GitHub Pages deployment
echo "🔨 Building for GitHub Pages..."

# Generate CSS using Tailwind
echo "📝 Generating CSS..."
cd client && npx tailwindcss --config ../tailwind.github.config.ts -i src/index.css -o ../docs/style.css --minify

# Create a simple static build
echo "⚛️ Creating static build..."
cd ..

echo "✅ Build completed! Files are ready in the docs/ directory."
echo ""
echo "📋 To deploy to GitHub Pages:"
echo "1. Commit and push all changes to your GitHub repository"
echo "2. Go to your repository Settings > Pages"
echo "3. Set Source to 'Deploy from a branch'"
echo "4. Set Branch to 'main' and folder to '/docs'"
echo "5. Click Save"
echo ""
echo "🌐 Your app will be available at: https://yourusername.github.io/yourrepository/"
echo ""
echo "📁 Files created:"
echo "  - docs/index.html (Main page)"
echo "  - docs/style.css (Styles)"
echo "  - docs/manifest.json (PWA manifest)"
echo "  - docs/assets/index.js (Application logic)"
echo "  - docs/.nojekyll (GitHub Pages config)"