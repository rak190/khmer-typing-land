#!/bin/bash
echo "Building Khmer Typing Land for GitHub Pages..."
cd client
npx vite build --outDir ../docs --base ./
echo ""
echo "Build complete! The 'docs/' folder contains your static site."
echo ""
echo "To publish on GitHub Pages:"
echo "1. Push the entire project (including docs/) to a GitHub repository"
echo "2. Go to Settings > Pages in your GitHub repository"
echo "3. Under 'Source', select 'Deploy from a branch'"
echo "4. Select 'main' branch and '/docs' folder"
echo "5. Click Save"
echo ""
echo "Your site will be live at: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/"
