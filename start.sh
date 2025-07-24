#!/bin/bash
# Ticker UI Startup Script
# Usage: ./start.sh

echo "🚀 Ticker UI Startup"
echo ""

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found. Please create it first."
    exit 1
fi

# Ask user for environment
echo "📍 Choose development environment:"
echo "  [L] Local - Run against local API (localhost:8000)"
echo "  [D] Docker - Run full stack with Docker Compose"
echo "  [P] Production - Build for production deployment"
echo ""

read -p "Enter your choice (L/D/P): " choice

case ${choice^^} in
    L)
        echo "📍 Local development mode selected"
        
        # Create .env.local if it doesn't exist
        if [ ! -f ".env.local" ]; then
            echo "📝 Creating .env.local from .env.example..."
            cp .env.example .env.local
            echo "✅ .env.local created. Please edit it if needed."
        fi
        
        # Check if node_modules exists
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        
        echo "🌐 Starting development server..."
        echo "📋 Available at: http://localhost:3000"
        echo "🔗 Make sure risk-api is running on http://localhost:8000"
        echo ""
        
        # Start development server
        npm run dev
        ;;
    
    D)
        echo "📍 Docker mode selected"
        
        # Create .env.docker if it doesn't exist
        if [ ! -f ".env.docker" ]; then
            echo "📝 Creating .env.docker from .env.example..."
            cp .env.example .env.docker
            echo "✅ .env.docker created. Please edit it if needed."
        fi
        
        echo "🐳 Starting Docker Compose..."
        echo "📋 UI available at: http://localhost:3000"
        echo "📋 API available at: http://localhost:10000"
        echo ""
        
        # Start Docker Compose
        docker-compose up --build
        ;;
    
    P)
        echo "📍 Production build mode selected"
        
        # Create .env.production if it doesn't exist
        if [ ! -f ".env.production" ]; then
            echo "📝 Creating .env.production from .env.example..."
            cp .env.example .env.production
            echo "✅ .env.production created. Please edit it before building."
        fi
        
        echo "🏗️ Building for production..."
        npm run build
        
        echo "✅ Build complete! Files are in the 'dist' directory."
        echo "🚀 To serve locally: npm run preview"
        ;;
    
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 