# 🔧 Fixing redirect_uri_mismatch Error

## The Issue
Google OAuth is rejecting the request because the redirect URI doesn't match between Google Cloud Console and Supabase.

## Solution

### Step 1: Check Your Supabase Redirect URI
Go to: https://supabase.com/dashboard/project/iosxrgofjxhmuzghkuwy/auth/providers
- Click on Google provider
- Copy the "Redirect URL" shown there
- It should be: `https://iosxrgofjxhmuzghkuwy.supabase.co/auth/v1/callback`

### Step 2: Update Google Cloud Console
Go to: https://console.cloud.google.com/apis/credentials
1. Find your OAuth 2.0 Client ID for this project
2. Click edit (pencil icon)
3. In "Authorized redirect URIs" section, make sure you have:
   ```
   https://iosxrgofjxhmuzghkuwy.supabase.co/auth/v1/callback
   ```

### Step 3: Common Redirect URIs to Add
Add these exact URLs to your Google OAuth client:
- `https://iosxrgofjxhmuzghkuwy.supabase.co/auth/v1/callback` (Production)
- `http://localhost:3000/auth/callback` (Local development - for testing)

### Step 4: Save and Test
1. Save changes in Google Cloud Console
2. Wait 2-3 minutes for changes to propagate
3. Try Google login again

## If Still Not Working
- Make sure there are no trailing slashes
- Check that HTTP vs HTTPS matches exactly
- Verify the Supabase project URL is correct: `iosxrgofjxhmuzghkuwy`

## ✅ CORRECT Redirect URI Found
Your Supabase project: `iosxrgofjxhmuzghkuwy.supabase.co`
Your redirect: `https://iosxrgofjxhmuzghkuwy.supabase.co/auth/v1/callback`

## Next Steps
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add this exact redirect URI: `https://iosxrgofjxhmuzghkuwy.supabase.co/auth/v1/callback`
4. Save and wait 2-3 minutes
5. Test Google login at http://localhost:3000/login