#!/bin/bash

# Pixel-Cut Quick Start Script

echo "🎬 Pixel-Cut Setup"
echo "=================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found!"
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "🔧 Please edit .env and add your Firebase API key and project ID:"
  echo "   nano .env"
  echo ""
  read -p "Press Enter after you've configured .env..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📤 To deploy to Vercel:"
echo "   npm run deploy"
echo ""
