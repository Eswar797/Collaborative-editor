# Deployment Guide

This guide covers deploying the Collaborative Editor application to production.

## Prerequisites

- Node.js installed
- Git repository (GitHub, GitLab, etc.)
- Accounts for hosting services (optional)

## Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Railway/Render (Backend) - Recommended

#### Frontend (Vercel)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login
   - Click "New Project"
   - Import your Git repository
   - Set root directory to `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - Add environment variable: `VITE_SERVER_URL` = your backend URL

3. **Update client code for production:**
   - Change `http://localhost:3001` to use environment variable

#### Backend (Railway or Render)

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `server`
6. Railway will auto-detect Node.js
7. Add environment variable: `PORT` (Railway provides this automatically)
8. Update CORS in `server.js` to allow your Vercel domain

**Render:**
1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your Git repository
5. Set:
   - Name: `collaborative-editor-server`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variable: `PORT=3001`
7. Update CORS in `server.js`

---

### Option 2: Deploy Both to Render

1. **Backend:**
   - Follow Render steps above for backend

2. **Frontend:**
   - In Render, click "New" → "Static Site"
   - Connect your Git repository
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add environment variable: `VITE_SERVER_URL` = your backend URL

---

### Option 3: Deploy to Heroku

#### Backend (Heroku)

1. Install Heroku CLI: [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Create Heroku app:**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   ```

#### Frontend (Vercel or Netlify)
- Follow Option 1 frontend steps

---

## Step-by-Step: Full Deployment

### 1. Prepare the Code

First, update the client to use environment variables:

**Update `client/src/components/CollaborativeEditor.tsx`:**
```typescript
const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');
```

**Create `client/.env.production`:**
```
VITE_SERVER_URL=https://your-backend-url.com
```

### 2. Update Server CORS

**Update `server/server.js`:**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

**Add to server environment variables:**
```
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 3. Build Commands

**Frontend:**
```bash
cd client
npm install
npm run build
```

**Backend:**
```bash
cd server
npm install
# No build needed, just run with: npm start
```

### 4. Production Scripts

Ensure `server/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## Quick Deploy Scripts

### Build Everything Locally

Create `build.sh`:
```bash
#!/bin/bash
echo "Building frontend..."
cd client
npm install
npm run build
echo "Frontend built successfully!"

echo "Preparing backend..."
cd ../server
npm install
echo "Backend ready!"
```

### Test Production Build Locally

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend (serve built files)
cd client
npx serve dist
```

---

## Environment Variables

### Frontend (Vercel/Netlify)
- `VITE_SERVER_URL` - Your backend server URL

### Backend (Railway/Render/Heroku)
- `PORT` - Server port (usually auto-set)
- `CLIENT_URL` - Your frontend URL for CORS
- `NODE_ENV=production`

---

## Database Considerations

Currently, the app stores data in memory. For production:

1. **Add persistent storage:**
   - Use Redis for real-time data
   - Use PostgreSQL/MongoDB for document storage
   - Or use a service like Upstash Redis

2. **Example with Redis:**
   ```bash
   npm install redis
   ```

---

## Security Checklist

- [ ] Update CORS to only allow your frontend domain
- [ ] Use HTTPS for both frontend and backend
- [ ] Add rate limiting to prevent abuse
- [ ] Add authentication (optional but recommended)
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS only for production domains

---

## Troubleshooting

### CORS Errors
- Make sure `CLIENT_URL` environment variable is set correctly
- Check that both frontend and backend URLs are correct

### Socket Connection Issues
- Verify `VITE_SERVER_URL` is set in frontend
- Check that backend is running and accessible
- Ensure WebSocket connections are allowed by hosting provider

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors: `cd client && npm run build`

---

## Recommended Hosting Services

**Frontend:**
- Vercel (easiest, best for React)
- Netlify
- Cloudflare Pages

**Backend:**
- Railway (easiest, auto-deploys)
- Render (free tier available)
- Heroku (paid, but reliable)
- DigitalOcean App Platform
- AWS Elastic Beanstalk

---

## Example Deployment URLs

After deployment, your URLs might look like:
- Frontend: `https://collaborative-editor.vercel.app`
- Backend: `https://collaborative-editor-server.railway.app`

Update the environment variables accordingly!

---

## Need Help?

If you encounter issues:
1. Check the hosting provider's logs
2. Verify environment variables are set
3. Test locally first with production build
4. Check CORS settings match your domains

