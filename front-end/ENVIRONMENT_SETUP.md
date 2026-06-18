# Environment Variables Configuration Guide

## Overview
This project uses environment variables to dynamically switch between local and production backend URLs. The Vite framework requires environment variable names to start with `VITE_` prefix to be accessible in the browser.

## Frontend Framework
- **Framework**: Vite (React)
- **Prefix**: `VITE_`
- **Syntax**: `import.meta.env.VITE_API_URL`

## Local Development Setup

### File: `.env.local` (in the `front-end` directory)
This file is already created with the following content:
```
VITE_API_URL=http://localhost:5000
```

### How to Use:
1. The `.env.local` file is automatically loaded by Vite during development
2. It is **git-ignored** and only used locally
3. All API calls in your frontend now use `${import.meta.env.VITE_API_URL}` instead of hardcoded URLs

### Start Local Development:
```bash
cd front-end
npm run dev
```

The frontend will connect to `http://localhost:5000` automatically.

---

## Production Deployment (Vercel)

### Step 1: Add Environment Variable to Vercel Dashboard
1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your frontend project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New Environment Variable**
5. Fill in the following:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://snapcook-backend.vercel.app`
   - **Environments**: Select "Production" (and "Preview" if you want it in preview deployments)
6. Click **Save**

### Step 2: Redeploy Your Frontend
After adding the environment variable, redeploy your frontend:
1. Push your code to GitHub (with the updated API files)
2. Vercel will automatically trigger a new build
3. Or manually trigger a redeploy from the Vercel dashboard

### Step 3: Verify the Connection
Once deployed, test that:
- The frontend connects to your production backend
- API requests go to `https://snapcook-backend.vercel.app` instead of localhost

---

## Files Modified

The following files were updated to use environment variables:

1. **`front-end/src/context/NotificationsContext.jsx`**
   - 2 API calls replaced with `${API_URL}/api/notifications`

2. **`front-end/src/pages/Login.jsx`**
   - 1 API call replaced with `${import.meta.env.VITE_API_URL}/api/users/login`

3. **`front-end/src/pages/Favorites.jsx`**
   - 2 API calls replaced with `${import.meta.env.VITE_API_URL}/api/users/favorites`

4. **`front-end/src/pages/Notifications.jsx`**
   - 2 API calls replaced with `${API_URL}/api/notifications/settings`

5. **`front-end/src/pages/Planning.jsx`**
   - 6 API calls replaced with `${API_URL}/api/planning`, `/api/orders`, `/api/planning/expenses`, `/api/planning/budget-limit`

---

## Important Notes

### `.env.local` vs `.env.production`
- **`.env.local`**: Used during development with `npm run dev` (local backend on port 5000)
- **`.env.production`**: Used during production build with `npm run build` (backend on Vercel)
  - ⚠️ Do NOT commit `.env.local` to version control (it's in `.gitignore`)
  - `.env.production` can be committed as it doesn't contain sensitive data

### Proxy Configuration (vite.config.js)
Your Vite config still has a proxy for `/api` routes during development:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

This proxy is only used for routes using relative paths (e.g., `/api/fridge/detect`). The files using `VITE_API_URL` will directly connect to the backend URL.

### Relative URLs vs Absolute URLs
- **Relative URLs** (e.g., `/api/fridge/detect`) → Use proxy in Vite
- **Absolute URLs** (e.g., `http://localhost:5000/api/...`) → Use `VITE_API_URL`

All files have been updated to use absolute URLs with `VITE_API_URL`.

---

## Troubleshooting

### Issue: "Cannot reach backend" in local development
**Solution**: 
- Ensure your backend is running on `http://localhost:5000`
- Check `.env.local` has the correct URL
- Restart Vite dev server with `npm run dev`

### Issue: "Cannot reach backend" in production
**Solution**:
- Verify the Vercel environment variable is set to `https://snapcook-backend.vercel.app`
- Check that your backend is deployed and accessible
- Ensure CORS is enabled on your backend to accept requests from your Vercel frontend domain

### Issue: Environment variable is undefined
**Solution**:
- Make sure the variable name starts with `VITE_` in `.env.local` or Vercel dashboard
- Verify you're using `import.meta.env.VITE_API_URL` (not `process.env`)
- Restart the dev server after changing `.env.local`

---

## Summary

✅ Your frontend now dynamically connects to the correct backend based on the environment.
✅ Local development uses `http://localhost:5000`
✅ Production on Vercel uses `https://snapcook-backend.vercel.app`
✅ All hardcoded URLs have been replaced with environment variables
