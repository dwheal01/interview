# Sticky Notes Board

A real-time collaborative infinite canvas for sticky notes built with React, TypeScript, Vite, and Firebase.

## Features

- 🎨 **Colorful Notes**: Create sticky notes in yellow, pink, blue, or green
- ♾️ **Infinite Canvas**: Pan and zoom to navigate your workspace
- 👥 **Real-time Collaboration**: Multiple users can work together simultaneously
- 🔒 **Soft Locks**: Notes are locked when being edited to prevent conflicts
- 👀 **Live Cursors**: See where other users are on the canvas
- 👤 **User Presence**: See who's online with colored avatars
- 💾 **Auto-save**: Notes automatically save to Firebase
- 🗑️ **Drag to Delete**: Drag notes to the trash to delete them
- 📱 **Responsive**: Works on desktop and tablet devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase Cloud Firestore
- **Hosting**: Firebase Hosting

## Prerequisites

- Node.js 18+ and npm
- Firebase account (for real-time collaboration)
- Git

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd stickynoteboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Register a web app and get your configuration
4. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
5. Fill in your Firebase credentials in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### 4. Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/{workspaceId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: These rules allow public access. For production, add authentication and proper restrictions.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Creating Notes

1. Select a color from the toolbar
2. Click "Add Note"
3. Move your mouse to position the ghost note
4. Click to place the note
5. Start typing to add title and content

### Editing Notes

- Click on a note to select it
- Edit the title or content directly
- Changes auto-save as you type

### Moving Notes

- Click and drag a note to move it around the canvas

### Panning and Zooming

- **Pan**: Right-click and drag
- **Zoom**: Scroll wheel (centered on cursor)
- **Reset View**: Click "Reset View" button to fit all notes

### Deleting Notes

- Drag a note over the trash icon (bottom-right)
- Release when the trash turns pink

### Collaboration

- Enter a username when first opening the app
- See other users' presence in the top-right
- Watch live cursors as others navigate
- Notes are locked when someone is editing them

## Development

### Project Structure

```
stickynoteboard/
├── src/
│   ├── components/      # React components
│   │   ├── Toolbar.tsx
│   │   ├── StickyBoard.tsx
│   │   ├── NoteCard.tsx
│   │   ├── TrashBin.tsx
│   │   ├── UsernameModal.tsx
│   │   ├── PresenceBar.tsx
│   │   └── RemoteCursorsLayer.tsx
│   ├── config/          # Firebase configuration
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types.ts         # TypeScript types
│   └── App.tsx          # Main app component
├── .env.local           # Environment variables (gitignored)
├── .env.example         # Environment variables template
└── firebase.json        # Firebase hosting config
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Firebase Hosting

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Build and deploy:
   ```bash
   npm run deploy
   ```

Your app will be live at:
- `https://stickynoteboard.web.app`
- `https://stickynoteboard.firebaseapp.com`

## Environment Variables

The app uses environment variables for Firebase configuration. See `.env.example` for the required variables.

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## Security

- Firebase API keys are stored in environment variables
- `.env.local` is gitignored
- For production, restrict your API keys in Google Cloud Console
- See `SECURITY_FIX.md` and `ROTATE_API_KEY.md` for security best practices

## Fallback Mode

If Firebase is not configured, the app falls back to `localStorage` for single-user mode. Real-time collaboration features (presence, cursors, locks) are disabled in this mode.

## License

MIT

## Contributing

This is a personal project, but suggestions and feedback are welcome!
