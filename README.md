# Ticker UI - Event-Driven Portfolio Management Frontend

A modern React frontend for managing investment portfolios with real-time price updates powered by an event-driven microservices architecture.

## 🚀 Features

### Portfolio Management

- **Add/Edit/Delete Positions**: Full CRUD operations for portfolio positions
- **Real-time Price Updates**: Trigger on-demand price refreshes through Redis Pub/Sub

- **Position Value Calculation**: Automatic calculation of position values based on latest prices

### Ticker Analysis

- **Ticker Metrics**: Calculate and display mean return, volatility, Sharpe ratio, and max drawdown
- **Live Price Data**: Integration with latest price data from the event-driven system
- **Ticker Search**: Search and validate ticker symbols before adding to portfolio

### Event-Driven Architecture Integration

- **Async Price Updates**: Triggers price updates via Redis Pub/Sub to the metrics-worker
- **Real-time Data**: Fetches latest prices stored by the background worker
- **Refresh Controls**: Manual refresh buttons for both individual positions and entire portfolio

## 🏗️ Architecture

This frontend integrates with the event-driven microservices:

```
[ User Action ] → [ risk-ui ] → [ risk-api ] ⇨ (Publishes to Redis)
                                                    ↓
                                              [ metrics-worker ] ⇦ (Subscribes)
                                                    ↓
                                              [ Fetches via yFinance ]
                                                    ↓
                                              [ Stores in PostgreSQL ]
                                                    ↓
[ Updated UI ] ← [ risk-ui ] ← [ risk-api ] ← [ Latest Price Data ]
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS 4.1** - Modern styling
- **Vite** - Build tool and dev server
- **Authentication** - JWT-based auth with protected routes

## 📱 Pages

### 2. Portfolio (`/portfolio`)

- Manage individual positions
- Real-time price display with individual refresh buttons
- Position value calculations
- Ticker search with autocomplete

### 3. Ticker Metrics (`/ticker`)

- Ticker analysis for individual tickers
- Latest price integration
- Ticker metrics visualization (Mean Return, Volatility, Sharpe Ratio, Max Drawdown)

### 4. Authentication

- Login/Register functionality
- Protected routes for portfolio features
- JWT token management

## 🔧 API Integration

The frontend communicates with the `risk-api` using these endpoints:

### Portfolio Management

- `GET /portfolio` - Fetch user positions
- `POST /portfolio` - Add new position
- `PUT /portfolio/{ticker}` - Update position quantity
- `DELETE /portfolio/{ticker}` - Remove position

### Price & Event System

- `POST /trigger-price-update` - Trigger Redis Pub/Sub price update
- `GET /latest-price/{ticker}` - Fetch stored price data
- `POST /trigger-portfolio-refresh` - Refresh all portfolio prices

### Ticker Analysis

- `POST /risk_metrics_from_ticker` - Calculate Ticker metrics
- `GET /search_ticker` - Search for ticker symbols

## 🚀 Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Docker (optional, for full stack)

### Quick Start

#### Option 1: Using Startup Scripts (Recommended)

```bash
# Windows
powershell -ExecutionPolicy Bypass -File start.ps1

# Unix/Linux/Mac
./start.sh
```

#### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local  # Edit as needed

# Start development server
npm run dev
```

### Environment Configuration

The project supports multiple environment configurations:

- **`.env.local`** - Local development (API on localhost:8000)
- **`.env.docker`** - Docker development (API on localhost:10000)
- **`.env.production`** - Production deployment

#### Environment Variables

```env
VITE_API_URL=http://localhost:8000  # Your risk-api URL
VITE_DEV_HOST=localhost             # Dev server host (optional)
VITE_DEV_PORT=3000                  # Dev server port (optional)
```

### Development Modes

#### Local Development

```bash
# Start UI only (API must be running separately)
npm run dev

# Or use startup script
./start.sh  # Choose 'L' for Local
```

#### Docker Development

```bash
# Start full stack (UI + API + Database + Redis)
docker-compose up --build

# Or use startup script
./start.sh  # Choose 'D' for Docker
```

#### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Or use startup script
./start.sh  # Choose 'P' for Production
```

## 🔮 Event-Driven Workflow

1. **User adds/updates ticker** → Frontend calls `/portfolio` API
2. **API publishes to Redis** → `ticker_updates` channel receives the ticker
3. **metrics-worker processes** → Fetches price via yFinance
4. **Price stored in DB** → Latest price available via API
5. **Frontend fetches updates** → UI shows real-time data

## 🎯 Key Benefits

- **Decoupled Architecture**: UI triggers events but doesn't wait for price fetching
- **Real-time Updates**: Background workers keep price data fresh
- **Scalable**: Can handle multiple concurrent price update requests
- **Responsive**: Modern UI with loading states and error handling
- **Event-Driven**: Leverages Redis Pub/Sub for async communication

## 📊 Live Demo

https://risk-ui-nine.vercel.app
_Powered by FastAPI backend hosted on Render_

## 🔧 Docker Commands

### Essential Commands

```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f risk-ui
docker-compose logs -f risk-api

# Service status
docker-compose ps

# Stop all services
docker-compose down
```

### Integration Testing

```bash
# Test UI
curl http://localhost:3000

# Test API integration
curl http://localhost:10000/healthz
```

## 🛠️ Troubleshooting

### Common Issues

**UI won't start**:

```bash
# Check if port 3000 is available
netstat -an | grep :3000

# Clear npm cache
npm cache clean --force
npm install
```

**API connection issues**:

```bash
# Verify API is running
curl http://localhost:8000/healthz  # Local
curl http://localhost:10000/healthz # Docker

# Check environment variables
cat .env.local  # or .env.docker
```

**Docker issues**:

```bash
# Reset Docker environment
docker-compose down -v
docker-compose up --build

# Check Docker logs
docker-compose logs -f
```

**Build failures**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 📝 Development Notes

- Uses Vite for fast development and building
- Hot module replacement (HMR) enabled for rapid development
- Automatic proxy configuration for API calls
- TypeScript support available (add .ts/.tsx files as needed)
- Tailwind CSS for styling with JIT compilation
- ESLint configuration for code quality

---

_Part of the Event-Driven Ticker Metrics Microservices Project_
