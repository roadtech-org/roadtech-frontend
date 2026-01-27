# RoadTech Frontend - Complete Setup Guide

## 🚀 Overview
Modern React + TypeScript frontend for the RoadTech roadside assistance platform.

## 📋 Prerequisites
- Node.js 20+ 
- npm or yarn
- Backend API running (see backend README)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Update `.env` with your backend URL:

```env
VITE_BASE_API_URL=http://localhost:8085/api
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── logo.png
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── api/               # API client and endpoints
│   │   ├── client.ts      # Axios instance with interceptors
│   │   ├── auth.ts        # Authentication APIs
│   │   ├── serviceRequest.ts
│   │   ├── mechanic.ts
│   │   ├── partsProvider.ts
│   │   └── admin.ts
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── common/       # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── maps/         # Map components (Leaflet)
│   │   ├── mechanic/     # Mechanic-specific components
│   │   └── parts/        # Parts provider components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── WebSocketContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useLocationTracking.ts
│   ├── pages/            # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── auth/        # Login & Register
│   │   ├── mechanic/    # Mechanic dashboard & jobs
│   │   ├── partsProvider/ # Parts provider dashboard
│   │   └── user/        # User dashboard & requests
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── cn.ts        # Tailwind class merger
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Key Features

### User Features
- ✅ Request roadside assistance
- ✅ Real-time tracking of mechanic location
- ✅ View request history
- ✅ Live status updates via WebSocket
- ✅ Interactive map for location selection

### Mechanic Features
- ✅ Toggle availability (online/offline)
- ✅ Live location tracking
- ✅ View pending and active jobs
- ✅ Accept/reject service requests
- ✅ Update job status (start, complete)
- ✅ Navigate to user location

### Parts Provider Features
- ✅ Manage shop status (open/closed)
- ✅ Add/edit/delete parts inventory
- ✅ Update stock levels
- ✅ Categorize parts
- ✅ Set prices and availability

### Admin Features
- ✅ Dashboard with statistics
- ✅ User management
- ✅ Verify mechanics and parts providers
- ✅ System logs viewer
- ✅ Request analytics

## 🔐 Authentication Flow

1. User registers with email/password
2. Backend returns JWT access token + refresh token
3. Access token stored in localStorage
4. Token auto-refreshes on 401 errors
5. WebSocket authenticated with JWT

## 🗺️ Maps Integration

Uses **Leaflet** for interactive maps:

- Location picker for users
- Live tracking map showing user and mechanic
- Route visualization
- Real-time position updates

## 📡 WebSocket Connection

Real-time features powered by STOMP over SockJS:

```typescript
// Auto-connects when user is authenticated
// Subscribes to:
- /topic/mechanic/requests (new requests for mechanics)
- /topic/user/{userId} (status updates for users)
- /topic/request/{requestId} (request-specific updates)
- /topic/mechanic/{mechanicId} (mechanic notifications)
```

## 🎨 UI Components

Built with custom components using Tailwind CSS:

- `Button` - Multiple variants and sizes
- `Input` - Form input with validation
- `Select` - Dropdown with options
- `Card` - Content container
- `Badge` - Status indicators
- `LocationPicker` - Interactive map for location
- `LiveTrackingMap` - Real-time tracking display

## 🚀 Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

Output in `dist/` folder ready for deployment.

## 🐳 Docker Deployment

```bash
# Build image
docker build -t roadtech-frontend .

# Run container
docker run -p 80:80 roadtech-frontend
```

## ☁️ Deploy to Vercel

1. Connect GitHub repo to Vercel
2. Set environment variable:
   ```
   VITE_BASE_API_URL=https://your-backend-url.com/api
   ```
3. Deploy automatically on push

## 🔧 Configuration Files

### vite.config.ts
- React plugin
- Tailwind CSS v4
- PWA configuration
- Proxy for API requests in dev mode

### tailwind.config.js
- Custom colors
- Responsive breakpoints
- Dark mode support

### tsconfig.json
- TypeScript strict mode (disabled for faster dev)
- Path aliases
- ESNext target

## 📦 Key Dependencies

```json
{
  "react": "^19.2.0",
  "react-router-dom": "^7.12.0",
  "@tanstack/react-query": "^5.90.19",
  "axios": "^1.13.2",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@stomp/stompjs": "^7.2.1",
  "sockjs-client": "^1.6.1",
  "react-hook-form": "^7.71.1",
  "zod": "^4.3.5",
  "react-hot-toast": "^2.6.0",
  "lucide-react": "^0.562.0",
  "tailwindcss": "^4.1.18"
}
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts
server: {
  port: 3000, // Change from 5173
}
```

### API connection failed
- Check `.env` file has correct backend URL
- Ensure backend is running
- Check CORS configuration in backend

### Map not displaying
- Check if Leaflet CSS is imported in `index.css`
- Verify latitude/longitude values are valid

### WebSocket not connecting
- Ensure backend WebSocket endpoint is accessible
- Check authentication token is valid
- Verify CORS allows WebSocket connections

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npm run build
```

## 📊 Performance Optimization

- Code splitting with React.lazy (if needed)
- Image optimization
- PWA for offline support
- Service Worker caching
- Gzip compression (nginx)

## 🔒 Security Features

- JWT authentication with refresh tokens
- HTTP-only cookie support (backend)
- XSS protection
- CSRF protection
- Input validation with Zod
- Role-based access control

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BASE_API_URL` | Backend API URL | `http://localhost:8085/api` |
| `NODE_ENV` | Environment | `development` or `production` |

## 🚀 Quick Start Guide

**For Users:**
1. Register as USER
2. Click "Request Assistance"
3. Select issue type and location
4. Wait for mechanic assignment
5. Track mechanic in real-time

**For Mechanics:**
1. Register as MECHANIC
2. Wait for admin verification
3. Go online from dashboard
4. Enable live location tracking
5. Accept pending requests
6. Navigate to user location
7. Start and complete service

**For Parts Providers:**
1. Register as PARTS_PROVIDER
2. Add shop location on map
3. Wait for admin verification
4. Add parts to inventory
5. Open shop for business

**For Admins:**
1. Login with admin credentials
2. Verify pending mechanics/providers
3. Monitor system logs
4. Manage users
5. View analytics

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify backend connection
- Ensure all environment variables are set
- Check network tab for failed requests

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ using React, TypeScript, and Tailwind CSS