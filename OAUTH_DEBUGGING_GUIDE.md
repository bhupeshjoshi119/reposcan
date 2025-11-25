# 🔍 GitHub OAuth Debugging Guide

## Current Issue
The redirect_uri error persists even after clearing cache. Let's debug this systematically.

## 🚨 Immediate Solutions (Try in Order)

### Solution 1: Force Specific Redirect URI
Let's temporarily hardcode the redirect URI to ensure it matches exactly.

**Update your `.env` file:**
```env
# Add this line to force the exact redirect URI
VITE_GITHUB_REDIRECT_URI="https://reposcan-one.vercel.app/auth/callback"
```

### Solution 2: Check Your Actual Deployment URL
First, let's verify what URL your app is actually deployed at:

1. **Check your Vercel dashboard** - what's the actual URL?
2. **Visit your deployed app** - what URL shows in the browser?

Common possibilities:
- `https://reposcan-one.vercel.app`
- `https://open-repo-lens-backup.vercel.app`
- `https://[project-name].vercel.app`

### Solution 3: Update GitHub OAuth App Settings

Go to [GitHub Developer Settings](https://github.com/settings/developers) and:

1. **Find your OAuth App** (Client ID: `Ov23liI4iEPNBseNPOm5`)
2. **Check current Authorization callback URL**
3. **Update it to match your actual deployment URL**

**Possible URLs to try:**
```
https://reposcan-one.vercel.app/auth/callback
https://open-repo-lens-backup.vercel.app/auth/callback
```

### Solution 4: Create New OAuth App (If needed)
If the existing app is misconfigured, create a new one:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `TechHub Production`
   - **Homepage URL**: `https://[your-actual-domain]`
   - **Authorization callback URL**: `https://[your-actual-domain]/auth/callback`
4. Update your `.env` with the new credentials

## 🔧 Debug Steps

### Step 1: Check What URL Your App Is Using
Add this temporary debug code to see what redirect URI is being generated:

**Add to `src/services/githubAuth.ts`:**
```typescript
getAuthUrl(): string {
  const redirectUri = this.getRedirectUri();
  console.log('🔍 DEBUG: Using redirect URI:', redirectUri);
  console.log('🔍 DEBUG: Current hostname:', window.location.hostname);
  console.log('🔍 DEBUG: Current full URL:', window.location.href);
  
  // ... rest of your existing code
}
```

### Step 2: Check Browser Network Tab
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to login
4. Look for the GitHub OAuth request
5. Check what `redirect_uri` parameter is being sent

### Step 3: Verify GitHub OAuth App Settings
1. Go to your GitHub OAuth app settings
2. Screenshot the current settings
3. Verify the callback URL matches exactly what your app is sending

## 🎯 Quick Fix Options

### Option A: Use Both Domains
Update your GitHub OAuth app to include both possible URLs:
```
https://reposcan-one.vercel.app/auth/callback
https://open-repo-lens-backup.vercel.app/auth/callback
```

### Option B: Force Specific Domain
Update your `.env` file:
```env
# Force specific redirect URI (replace with your actual domain)
VITE_GITHUB_REDIRECT_URI="https://reposcan-one.vercel.app/auth/callback"
```

### Option C: Use Different OAuth App
If you have multiple OAuth apps, try using the other one:
```env
# Try the other OAuth app
VITE_GITHUB_CLIENT_ID="Ov23liEMGIRLG2hv8qtC"
VITE_GITHUB_CLIENT_SECRET="834a9142ce52408d2b0ac75b28474aa2c51d3607"
VITE_GITHUB_REDIRECT_URI="https://reposcan-one.vercel.app/auth/callback"
```

## 🚀 Deployment-Specific Fixes

### For Vercel Deployment
1. **Check your Vercel project settings**
2. **Verify the custom domain** (if any)
3. **Check if you have multiple deployments**

### Common Vercel URLs
- Main deployment: `https://[project-name].vercel.app`
- Custom domain: `https://your-custom-domain.com`
- Branch deployments: `https://[project-name]-git-[branch].vercel.app`

## 📋 Checklist for Resolution

- [ ] Identify your actual deployment URL
- [ ] Update GitHub OAuth app callback URL to match exactly
- [ ] Clear all browser data (not just cache)
- [ ] Try incognito/private browsing mode
- [ ] Check browser console for any errors
- [ ] Verify environment variables are loaded correctly

## 🆘 If Nothing Works

### Last Resort: Complete Reset
1. **Create a new GitHub OAuth app** with correct settings
2. **Update `.env` with new credentials**
3. **Deploy the changes**
4. **Test in incognito mode**

### Contact Support
If the issue persists, it might be:
- GitHub OAuth app approval pending
- Account restrictions
- Regional access issues

---

**Let me know what you find when you check your actual deployment URL and GitHub OAuth app settings!** 🔍