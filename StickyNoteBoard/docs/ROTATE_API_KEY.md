# How to Rotate Firebase API Key

## You do NOT need to create a new project!

You can regenerate your API key in the existing Firebase project. Here's how:

## Steps:

1. **Go to Firebase Console**

   - Visit https://console.firebase.google.com/
   - Select your `stickynoteboard` project

2. **Navigate to Project Settings**

   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

3. **Find Your Web App**

   - Scroll down to the "Your apps" section
   - Find your web app (the one with the `</>` icon)

4. **Regenerate the API Key**

   - **If you see a settings icon (⚙️)**: Click it and select "Regenerate key"
   - **If you don't see a settings icon**: Use Method 2 below (Google Cloud Console)
   - **Alternative**: Try clicking directly on the app card or look for a menu (three dots ⋮)

5. **Update Your .env.local File**
   - Copy the new API key
   - Update `VITE_FIREBASE_API_KEY` in your `.env.local` file
   - Restart your dev server

## Important Notes:

- **The old API key will stop working** after regeneration (usually within a few minutes)
- **All other config values stay the same** (projectId, authDomain, etc.)
- **You only need to update the API key** in your `.env.local` file
- **No need to change anything else** - your Firestore database, hosting, etc. all remain the same

## After Regenerating:

1. Update `.env.local` with the new API key
2. Restart your dev server (`npm run dev`)
3. Test that the app still works
4. The old key in git history will be invalid, so even if someone finds it, it won't work

## Method 2: Through Google Cloud Console (More Reliable)

If you don't see a settings icon in Firebase Console, use Google Cloud Console instead:

1. **Go to Google Cloud Console**

   - Visit https://console.cloud.google.com/
   - Make sure you're in the correct project (should be `stickynoteboard`)

2. **Navigate to Credentials**

   - Go to "APIs & Services" → "Credentials" (in the left sidebar)
   - Or search for "Credentials" in the top search bar

3. **Find Your API Key**

   - Look for "API keys" section
   - Find the key that matches your Firebase project
   - Click on the key name to edit it

4. **Regenerate the Key**

   - Click "Regenerate key" button at the top
   - Confirm the action
   - **Copy the new key immediately** (you won't be able to see it again!)

5. **Update Your .env.local File**
   - Update `VITE_FIREBASE_API_KEY` with the new key
   - Restart your dev server

## Alternative: Restrict the API Key (Better Security)

Instead of regenerating, you can also **restrict the API key** to prevent unauthorized use:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your Firebase API key
4. Click on it to edit
5. Under "Application restrictions", set:
   - **HTTP referrers (web sites)**: Add your domain (e.g., `stickynoteboard.web.app/*`, `stickynoteboard.firebaseapp.com/*`)
6. Under "API restrictions", restrict to only:
   - Firebase Authentication API
   - Cloud Firestore API
   - Firebase Hosting API
7. Save

This way, even if someone has your API key, they can only use it from your domains and for specific APIs.
