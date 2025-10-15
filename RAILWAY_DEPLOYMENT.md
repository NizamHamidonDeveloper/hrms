# Railway Deployment Guide

## 🚀 Deploying HRMS to Railway

### Prerequisites
- GitHub repository with your code
- Railway account (free tier available)

### Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your HRMS repository

### Step 2: Configure Environment Variables

In your Railway project dashboard, go to **Variables** tab and add:

```
NEXTAUTH_SECRET=your-secure-secret-key-here-change-this-in-production
NEXTAUTH_URL=https://your-app-name.railway.app
NODE_ENV=production
```

**Important:** Replace `your-app-name` with your actual Railway app name.

### Step 3: Deploy

Railway will automatically:
- Detect it's a Next.js app
- Install dependencies (`npm ci`)
- Build the app (`npm run build`)
- Start the app (`npm start`)

### Step 4: Test Your Deployment

1. **Test Authentication Endpoint:**
   ```
   https://your-app-name.railway.app/api/test-auth
   ```

2. **Test Login Page:**
   ```
   https://your-app-name.railway.app/login
   ```

### Test Credentials
- **Admin:** `admin` / `password` → `/admin/dashboard`
- **Manager:** `manager` / `password` → `/manager/dashboard`
- **Employee:** `employee` / `password` → `/employee/dashboard`

### Railway Advantages over Vercel

✅ **Better for Authentication:** Railway handles server-side authentication better
✅ **Persistent Environment:** Variables persist across deployments
✅ **Database Ready:** Easy to add PostgreSQL later
✅ **More Flexible:** Better for complex API routes
✅ **Free Tier:** Generous free tier with no time limits

### Troubleshooting

If you encounter issues:

1. **Check Railway Logs:**
   - Go to your project dashboard
   - Click on "Deployments"
   - View logs for any errors

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check that `NEXTAUTH_URL` matches your Railway domain

3. **Build Issues:**
   - Railway uses the `railway.json` and `nixpacks.toml` configs
   - These are already configured for your Next.js app

### Next Steps (Optional)

1. **Add Database:** Railway makes it easy to add PostgreSQL
2. **Custom Domain:** Add your own domain in Railway settings
3. **Monitoring:** Railway provides built-in monitoring and metrics
