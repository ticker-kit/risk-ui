#!/usr/bin/env pwsh
# Risk UI Startup Script
# Usage: ./start.ps1 or powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "🚀 Risk UI Startup" -ForegroundColor Green
Write-Host ""

# Check if .env.example exists
if (-not (Test-Path ".env.example")) {
    Write-Host "❌ .env.example not found. Please create it first." -ForegroundColor Red
    exit 1
}

# Ask user for environment
Write-Host "📍 Choose development environment:" -ForegroundColor Yellow
Write-Host "  [L] Local - Run against local API (localhost:8000)" -ForegroundColor Cyan
Write-Host "  [D] Docker - Run full stack with Docker Compose" -ForegroundColor Cyan
Write-Host "  [P] Production - Build for production deployment" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter your choice (L/D/P)"

switch ($choice.ToUpper()) {
    "L" {
        Write-Host "📍 Local development mode selected" -ForegroundColor Green
        
        # Create .env.local if it doesn't exist
        if (-not (Test-Path ".env.local")) {
            Write-Host "📝 Creating .env.local from .env.example..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env.local"
            Write-Host "✅ .env.local created. Please edit it if needed." -ForegroundColor Green
        }
        
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        Write-Host "🌐 Starting development server..." -ForegroundColor Green
        Write-Host "📋 Available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "🔗 Make sure risk-api is running on http://localhost:8000" -ForegroundColor Yellow
        Write-Host ""
        
        # Start development server
        npm run dev
    }
    
    "D" {
        Write-Host "📍 Docker mode selected" -ForegroundColor Green
        
        # Create .env.docker if it doesn't exist
        if (-not (Test-Path ".env.docker")) {
            Write-Host "📝 Creating .env.docker from .env.example..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env.docker"
            Write-Host "✅ .env.docker created. Please edit it if needed." -ForegroundColor Green
        }
        
        Write-Host "🐳 Starting Docker Compose..." -ForegroundColor Green
        Write-Host "📋 UI available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "📋 API available at: http://localhost:10000" -ForegroundColor Cyan
        Write-Host ""
        
        # Start Docker Compose
        docker-compose up --build
    }
    
    "P" {
        Write-Host "📍 Production build mode selected" -ForegroundColor Green
        
        # Create .env.production if it doesn't exist
        if (-not (Test-Path ".env.production")) {
            Write-Host "📝 Creating .env.production from .env.example..." -ForegroundColor Yellow
            Copy-Item ".env.example" ".env.production"
            Write-Host "✅ .env.production created. Please edit it before building." -ForegroundColor Green
        }
        
        Write-Host "🏗️ Building for production..." -ForegroundColor Green
        npm run build
        
        Write-Host "✅ Build complete! Files are in the 'dist' directory." -ForegroundColor Green
        Write-Host "🚀 To serve locally: npm run preview" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
} 