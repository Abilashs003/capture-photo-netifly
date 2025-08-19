# Deployment Instructions

## Option 1: Deploy to Netlify (Recommended)

### Method A: Drag & Drop
1. Visit [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire `capture-photo` folder to the browser window
3. Netlify will automatically deploy your site
4. You'll get a URL like `https://amazing-site-123.netlify.app`

### Method B: Git-based Deployment
1. Create a GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/capture-photo.git
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```

2. Connect to Netlify:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Deploy settings are already configured in `netlify.toml`
   - Click "Deploy site"

## Option 2: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: capture-photo (or press enter)
   - Directory: . (current directory)
   - Override settings: No

## Post-Deployment

1. Update Supabase CORS settings:
   - Add your deployment URL to allowed origins
   - In Supabase Dashboard → Storage → Settings → CORS

2. Test the app:
   - Visit your deployment URL
   - Test photo capture functionality
   - Verify uploads to Supabase

## Custom Domain (Optional)

Both Netlify and Vercel support custom domains:
- Netlify: Site settings → Domain management
- Vercel: Project settings → Domains