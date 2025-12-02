# Security Fix: Removing Firebase Secrets from Git History

## What happened
Firebase API keys and configuration were committed to the repository. These have been moved to environment variables.

## Steps to fix:

### 1. Create .env.local file (DO THIS FIRST - before removing from git)
Create a file named `.env.local` in the root directory with:
```
VITE_FIREBASE_API_KEY=AIzaSyBqlmCg529ILuG0DoxhYeVvrw11SUOCJzw
VITE_FIREBASE_AUTH_DOMAIN=stickynoteboard.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stickynoteboard
VITE_FIREBASE_STORAGE_BUCKET=stickynoteboard.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=388409253226
VITE_FIREBASE_APP_ID=1:388409253226:web:c9ec4fb0886af28b8cd913
VITE_FIREBASE_MEASUREMENT_ID=G-ZRWLYH7F2R
```

### 2. Remove secrets from git history
Run these commands to remove the secrets from git history:

```bash
# Remove the file from git tracking (but keep it locally)
git rm --cached src/config/firebase.ts

# Commit the removal
git commit -m "Remove Firebase secrets from repository"

# Force push to overwrite history (WARNING: This rewrites history)
git push --force
```

**OR** if you want to completely remove it from history (more thorough but more destructive):

```bash
# Use git filter-branch or BFG Repo-Cleaner to remove from all history
# This is more complex - see below for alternatives
```

### 3. Rotate your Firebase API keys (RECOMMENDED)
Since the keys were exposed, you should rotate them:

1. Go to Firebase Console > Project Settings > General
2. Under "Your apps", find your web app
3. Click the settings icon and "Regenerate key" for the API key
4. Update your `.env.local` file with the new key

### 4. Alternative: Use BFG Repo-Cleaner (if you want to completely remove from history)
If you want to completely remove the secrets from all git history:

```bash
# Install BFG (if not installed)
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with the secrets to remove
echo "AIzaSyBqlmCg529ILuG0DoxhYeVvrw11SUOCJzw" > secrets.txt
echo "stickynoteboard" >> secrets.txt
echo "388409253226" >> secrets.txt

# Remove from history
bfg --replace-text secrets.txt

# Clean up
rm secrets.txt

# Force push
git push --force
```

## What was changed:
- ✅ `src/config/firebase.ts` now uses environment variables
- ✅ `.gitignore` updated to exclude `.env.local`
- ✅ `.env.example` created as a template
- ✅ Secrets moved to `.env.local` (gitignored)

## Important Notes:
- The `.env.local` file is now gitignored and won't be committed
- You need to create `.env.local` manually (it's blocked from auto-creation for security)
- Consider rotating your Firebase API keys since they were exposed
- If this is a public repository, the secrets are already exposed in the git history

