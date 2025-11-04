#!/bin/bash

# Railway Deployment Script for Scribe-Amp
# Usage: ./deploy-railway.sh

set -e

echo "🚀 Deploying Scribe-Amp to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Set Railway token
export RAILWAY_TOKEN=${RAILWAY_TOKEN:-"20727ba7-8cd3-4a1b-a566-c2014ce081da"}

echo "📦 Building and deploying services..."

# Try to deploy the project
if railway status &> /dev/null; then
    echo "✅ Railway project linked, deploying..."
    railway up
else
    echo "⚠️  Project not linked. Please run 'railway link' first or create a new project:"
    echo "   1. Login: railway login"
    echo "   2. Create project: railway init"
    echo "   3. Deploy: railway up"
    echo ""
    echo "Or link to existing project:"
    echo "   railway link [PROJECT_ID]"
fi

echo "🎉 Deployment process completed!"
echo "💡 Don't forget to set your environment variables in Railway dashboard:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET" 
echo "   - JWT_SECRET"
echo "   - LLM_API_KEY (optional)"
