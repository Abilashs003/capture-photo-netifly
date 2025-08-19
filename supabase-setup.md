# Supabase Setup Instructions

To use this photo capture app with Supabase, follow these setup instructions.

## Steps to Set Up Supabase:

### 1. Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New project"
3. Fill in the project details:
   - Project name
   - Database password (save this securely)
   - Region (choose closest to your users)
4. Click "Create new project" and wait for setup to complete

### 2. Get Your Project Credentials
1. In your project dashboard, go to "Settings" → "API"
2. Copy these values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **anon public** key: This is your `SUPABASE_ANON_KEY`

### 3. Create a Storage Bucket
1. In the sidebar, go to "Storage"
2. Click "Create bucket"
3. Name it `photos` (or update `STORAGE_BUCKET` in app.js)
4. Set it as a **Public bucket** (toggle on)
5. Click "Create bucket"

### 4. Configure Bucket Policies
1. Click on your `photos` bucket
2. Go to "Policies" tab
3. Click "New policy" → "For full customization"
4. Create the following policies:

**Allow Public Read Access:**
```sql
-- Policy name: Public Read Access
-- Allowed operation: SELECT
-- Target roles: anon, authenticated

true
```

**Allow Authenticated Upload:**
```sql
-- Policy name: Allow Upload
-- Allowed operation: INSERT
-- Target roles: anon

true
```

### 5. Configure CORS (Important for Web Apps)
1. In your Supabase dashboard, go to "Storage" → "Settings"
2. Add your domain to allowed origins, or use `*` for development:
```json
[
  {
    "origin": ["*"],
    "allowed_methods": ["GET", "POST", "PUT", "DELETE"],
    "allowed_headers": ["*"],
    "exposed_headers": ["*"],
    "max_age_seconds": 3600
  }
]
```

### 6. Update the App Configuration
Open `app.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
const STORAGE_BUCKET = 'photos'; // Your bucket name
```

## File Size Limits
- Default file upload limit: 50MB
- To change this, go to Storage → Settings → File upload limit

## Security Considerations

### For Development:
The current setup allows anonymous uploads which is fine for testing.

### For Production:
1. Implement user authentication
2. Update bucket policies to require authentication:
```sql
-- Only allow authenticated users to upload
auth.role() = 'authenticated'
```

3. Consider adding file validation:
```sql
-- Limit file types and sizes
(storage.foldername(name) = 'uploads') AND 
(storage.extension(name) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])) AND
(octet_length(content) <= 10485760) -- 10MB limit
```

## Running the App

1. Make sure all files are in the same directory
2. Update `app.js` with your Supabase configuration
3. Open `index.html` in a web browser or serve it using a local web server
4. For HTTPS (required for camera access on mobile):
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - Or deploy to Vercel, Netlify, or Supabase Hosting

## Troubleshooting

### "Failed to upload" error:
- Check your bucket name matches in app.js
- Ensure bucket is set to public
- Verify your Supabase credentials
- Check CORS configuration

### Images not loading:
- Verify bucket policies allow public read access
- Check browser console for CORS errors
- Ensure the bucket name is correct

### Camera not working:
- Camera access requires HTTPS
- Check browser permissions for camera access
- On iOS, use Safari for best compatibility