# Firebase Setup Instructions

## Overview
The sticky notes app has been extended with real-time collaboration features using Firebase Cloud Firestore. Multiple users can now work together on the same board with live synchronization.

## Features Implemented

1. **Multi-user Support**
   - Username modal for user identification
   - Persistent user session in localStorage
   - Unique user colors for avatars and cursors

2. **Real-time Notes Sync**
   - Notes are synced via Firestore instead of localStorage
   - Create, update, move, and delete operations sync to all users
   - Canvas position/zoom still stored locally

3. **Soft Locks**
   - When a user edits a note, they acquire an exclusive lock
   - Other users see a grey overlay and cannot edit or drag locked notes
   - Locks are released when the user stops editing

4. **User Presence**
   - Shows online users as circular avatars in the top-right
   - Heartbeat system keeps presence up to date
   - Users appear/disappear based on last seen timestamp

5. **Live Cursors**
   - Each user's cursor is visible to others
   - Cursor position updates in real-time (throttled)
   - Shows username label next to cursor

## Firebase Configuration

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create a new project or select an existing one
3. Enable Cloud Firestore Database
4. Start in test mode (or set up security rules later)

### Step 2: Get Firebase Config
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Copy the Firebase configuration object

### Step 3: Update Config File
Edit `src/config/firebase.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### Step 4: Firestore Security Rules (Optional but Recommended)
In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{workspaceId}/{collection=**} {
      allow read, write: if true; // For testing - restrict in production
    }
  }
}
```

**Note:** For production, implement proper authentication and security rules.

## Firestore Collections Structure

The app uses the following collections under `/workspaces/default/`:

- **notes/{noteId}** - Sticky notes with title, content, position, color, zIndex
- **locks/{noteId}** - Edit locks (one per note, keyed by noteId)
- **presence/{userId}** - User presence with lastSeen timestamp
- **cursors/{userId}** - Live cursor positions

## Usage

1. **First Time User**
   - Enter a username in the modal
   - A unique user ID and color will be assigned
   - You'll join the shared workspace

2. **Returning User**
   - Your username and settings are remembered
   - You'll automatically join the workspace

3. **Collaboration**
   - See other users' avatars in the top-right
   - See their cursors move in real-time
   - Notes sync automatically across all users
   - Locked notes show a grey overlay with editor name

## Technical Details

- **Workspace ID**: Hard-coded as "default" (can be extended later)
- **Heartbeat**: Presence updates every 15 seconds
- **Cursor Updates**: Throttled to every 100ms
- **Presence Timeout**: 30 seconds (users appear offline after this)
- **Cursor Timeout**: 10 seconds (cursors disappear after this)

## Notes

- Canvas transform (pan/zoom) is still stored locally per user
- Notes are now the source of truth in Firestore
- LocalStorage is used for user session and canvas state only
- All note operations (create, update, delete) write to Firestore

