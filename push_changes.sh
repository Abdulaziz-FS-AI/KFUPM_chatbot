#!/bin/bash
# Script to push changes to GitHub

echo "=========================================="
echo "  Pushing Changes to GitHub"
echo "=========================================="
echo ""

cd /home/shared_dir/github-repo

# Show what will be pushed
echo "Files to be pushed:"
git status --short
echo ""

# Add files
git add js/chat.js admin.html

# Commit
git commit -m "Fix: Configure ngrok backend URL and API key for Vercel deployment"

# Push
echo "Pushing to GitHub..."
echo "You will be asked for:"
echo "  Username: Abdulaziz-FS-AI"
echo "  Password: [Your GitHub Personal Access Token]"
echo ""

git push origin main

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Wait 1-2 minutes for Vercel to auto-deploy"
echo "  2. Visit: https://kfupm-chatbot-2tz3.vercel.app"
echo "  3. Test the chatbot - it should work now!"
echo ""