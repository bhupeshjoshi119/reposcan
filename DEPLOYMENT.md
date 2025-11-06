# Deployment Guide

## GitHub OAuth Setup

### Development Environment (localhost:8080)

1. **Create Development OAuth App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: `Your App - Development`
     - **Homepage URL**: `http://localhost:8080`
     - **Authorization callback URL**: `http://localhost:8080/auth/callback`

2. **Update .env for Development**:
   ```env
   VITE_GITHUB_CLIENT_ID="your_dev_client_id"
   VITE_GITHUB_CLIENT_SECRET="your_dev_client_secret"
   VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"
   ```

### Production Environment (Vercel)

1. **Create Production OAuth App**:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in:
     - **Application name**: `Your App - Production`
     - **Homepage URL**: `https://your-domain.vercel.app`
     - **Authorization callback URL**: `https://your-domain.vercel.app/auth/callback`

2. **Set Vercel Environment Variables**:
   ```bash
   vercel env add VITE_GITHUB_CLIENT_ID
   vercel env add VITE_GITHUB_CLIENT_SECRET
   vercel env add VITE_GITHUB_REDIRECT_URI
   ```

## Quick Fix for Current Issue

### Option 1: Update Existing OAuth App
1. Go to your GitHub OAuth App settings
2. Change the callback URL to: `http://localhost:8080/auth/callback`
3. Restart your development server

### Option 2: Use Environment Override
1. Create `.env.local` file:
   ```env
   VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"
   ```
2. Restart your development server

## Deployment Steps

### 1. Prepare for Production
```bash
# Build the application
npm run build

# Test the build locally
npm run preview
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_GITHUB_CLIENT_ID production
vercel env add VITE_GITHUB_CLIENT_SECRET production
vercel env add VITE_GITHUB_REDIRECT_URI production
```

### 3. Configure Domain
1. Set up custom domain in Vercel dashboard
2. Update GitHub OAuth App with new domain
3. Update environment variables

## Environment Variables Reference

### Required Variables
```env
# Supabase (if using)
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# GitHub OAuth
VITE_GITHUB_CLIENT_ID="your_client_id"
VITE_GITHUB_CLIENT_SECRET="your_client_secret"
VITE_GITHUB_REDIRECT_URI="your_callback_url"
```

### Development vs Production
```env
# Development (.env.local)
VITE_GITHUB_REDIRECT_URI="http://localhost:8080/auth/callback"

# Production (Vercel Environment Variables)
VITE_GITHUB_REDIRECT_URI="https://your-domain.vercel.app/auth/callback"
```

## Troubleshooting

### OAuth Redirect Mismatch
- **Error**: "The redirect_uri MUST match the registered callback URL"
- **Solution**: Ensure the callback URL in GitHub OAuth App matches your environment

### Development Server Issues
- **Port Conflicts**: Change port in `vite.config.ts` or use `--port` flag
- **HTTPS Required**: Some OAuth providers require HTTPS (use ngrok for local HTTPS)

### Production Deployment Issues
- **Environment Variables**: Ensure all variables are set in Vercel
- **Domain Configuration**: Update OAuth App when changing domains
- **Build Errors**: Check that all dependencies are in `package.json`

## Security Best Practices

### Environment Variables
- Never commit `.env` files with secrets
- Use different OAuth apps for dev/prod
- Rotate secrets regularly

### OAuth Configuration
- Use specific callback URLs (avoid wildcards)
- Implement proper error handling
- Add rate limiting for production

### Deployment Security
- Enable Vercel security headers
- Use HTTPS only in production
- Implement proper CORS policies

## Monitoring & Maintenance

### Health Checks
- Monitor OAuth success rates
- Track API rate limits
- Set up error alerting

### Updates
- Keep dependencies updated
- Monitor GitHub API changes
- Test OAuth flows regularly