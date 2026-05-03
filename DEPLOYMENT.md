# Deployment Guide: GitHub + Vercel + Firebase

This guide explains how to deploy Khmer-Typing-Land using GitHub (repository), Vercel (hosting), and Firebase (optional).

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Firebase account (optional, for authentication/additional database)
- PostgreSQL database (external, not included - see Database Setup below)
- Node.js 20.x installed locally

## 🔧 Database Setup

This project uses **PostgreSQL** for data storage. You need to set up an external PostgreSQL database:

### Option 1: Free PostgreSQL Hosting
- **Supabase** (PostgreSQL + real-time features): https://supabase.com
- **Railway** (PostgreSQL): https://railway.app
- **Render** (PostgreSQL): https://render.com
- **Vercel Postgres** (built for Vercel): https://vercel.com/storage/postgres

### Option 2: Self-Hosted
- Use a dedicated server or cloud provider (AWS RDS, DigitalOcean, etc.)

### Database Configuration
Once you have PostgreSQL running:
1. Note your database connection URL: `postgresql://user:password@host:port/database`
2. You'll add this as an environment variable in Vercel (see below)

## 📚 Step-by-Step Deployment

### Step 1: Prepare Your Project

```bash
# Remove node_modules and reinstall (clean install)
rm -r node_modules
npm install

# Verify build works locally
npm run build

# Check for TypeScript errors
npm run check
```

### Step 2: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Clean up Replit dependencies, prepare for Vercel deployment"

# Add remote (replace USERNAME and REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 3: Set Up on Vercel

1. **Connect Vercel to GitHub:**
   - Go to https://vercel.com/new
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories
   - Select your Khmer-Typing-Land repository

2. **Configure Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   ```

   If using Socket.IO for multiplayer:
   ```
   SOCKET_URL=https://your-vercel-domain.vercel.app
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for the deployment to complete
   - Your site will be available at `https://your-project-name.vercel.app`

### Step 4: Initialize Database (First Time Only)

After deployment, run migrations:

```bash
# Local terminal in project root
DATABASE_URL=your_database_url npm run db:push
```

## 🔑 Setting Up Firebase (Optional)

Firebase is optional but recommended for:
- Authentication (via Firebase Auth)
- File storage (via Cloud Storage)
- Real-time database backup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Follow the setup wizard

### Step 2: Add Firebase Config to Your Project

1. In Firebase Console, go to Project Settings
2. Copy the config object
3. Add to `client/src/lib/firebase.ts` (create if doesn't exist):

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

4. Add Firebase environment variables to Vercel:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.

## 🚀 Continuous Deployment

After initial setup:
1. Make changes locally
2. Commit and push to GitHub: `git push`
3. Vercel automatically detects changes and redeploys
4. Check deployment status at https://vercel.com/dashboard

## 📊 Environment Variables Reference

### Required for Production
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`

### Optional
- `SOCKET_URL` - For Socket.IO real-time features
- `VITE_FIREBASE_*` - If using Firebase
- `STRIPE_SECRET_KEY` - If using Stripe payments

## 🛠️ Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Run `npm run check` locally to verify TypeScript
- Clear node_modules: `rm -r node_modules && npm install`

### Database Connection Error
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check database credentials
- Ensure database allows connections from Vercel IPs
- For Supabase: Check "Database" settings for connection limits

### Socket.IO Not Working
- Verify `SOCKET_URL` environment variable is set
- Check CORS settings in server
- Ensure WebSocket is enabled in Vercel (it is by default)

### Performance Issues
- Monitor database queries
- Use Vercel Analytics dashboard
- Check Lighthouse scores

## 📝 Project Structure for Deployment

```
Khmer-Typing-Land/
├── client/              # React frontend (built to dist/public)
├── server/              # Express backend API
├── shared/              # Shared TypeScript code
├── package.json         # Dependencies
├── vite.config.ts       # Vite build configuration
├── vercel.json          # Vercel deployment config
└── DEPLOYMENT.md        # This file
```

## 🔐 Security Checklist

Before going live:
- [ ] Database URL is in environment variables, NOT in code
- [ ] Firebase API keys are in environment variables
- [ ] API authentication is enabled
- [ ] CORS is properly configured for your domain
- [ ] All secrets are removed from git history
- [ ] `.gitignore` includes `.env` and `node_modules`

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check Application Insights/monitoring
3. Review server logs: `npm run dev` locally to reproduce issues
4. Check PostgreSQL logs if database related

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. Set up custom domain (optional)
3. Configure CDN for faster delivery (included with Vercel Pro)
4. Set up monitoring and error tracking (Sentry, etc.)
5. Configure auto-scaling for database (if using external provider)

---

**Last Updated:** May 2026
**Compatible with:** Node.js 20.x, Vite 7.x, React 19.x
