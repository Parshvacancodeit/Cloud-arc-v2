#!/usr/bin/env bash
# ============================================================
# CloudArc — Deployment Preparation Helper
# ============================================================

echo "📦 Initializing Git Repository..."
git init

# Add all files (respecting the .gitignore files we just created)
git add .

echo "✅ Git repository initialized and files staged!"
echo ""
echo "🚀 NEXT STEPS TO GET LIVE:"
echo "------------------------------------------------"
echo "1. Create a NEW repository on GitHub (e.g., 'cloudarc-project')."
echo "2. Copy the remote URL (e.g., https://github.com/yourname/cloudarc.git)."
echo "3. Run these commands in your terminal:"
echo "   git commit -m 'Initial commit for cloud deployment'"
echo "   git branch -M main"
echo "   git remote add origin YOUR_REPOSITORY_URL"
echo "   git push -u origin main"
echo "------------------------------------------------"
echo "4. Go to Render.com and connect your GitHub repo for the Backend."
echo "5. Go to Vercel.com and connect your GitHub repo for the Frontend."
echo "------------------------------------------------"
echo "Check 'deployment_roadmap.md' for specific cloud settings!"
