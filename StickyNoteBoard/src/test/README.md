# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Sticky Notes Board application, ensuring that refactoring can be done safely with confidence that functionality is preserved.

## Test Structure

```
src/test/
├── setup.ts              # Test configuration and global mocks
├── mocks/
│   ├── firebase.ts       # Firebase/Firestore mocks
│   └── localStorage.ts   # localStorage mocks
├── utils/
│   └── testUtils.tsx     # Test utilities and helpers
└── integration/
    ├── noteOperations.test.tsx    # Note CRUD operations
    ├── canvasOperations.test.tsx  # Canvas pan/zoom/reset
    └── collaboration.test.tsx     # Multi-user features

src/
├── utils/
│   └── userSession.test.ts        # User session utilities
├── hooks/
│   └── useFirestore.test.tsx      # Firestore hooks
└── components/
    ├── NoteCard.test.tsx          # Note card component
    ├── Toolbar.test.tsx           # Toolbar component
    └── TrashBin.test.tsx          # Trash bin component
```

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Unit Tests
- ✅ Utility functions (userSession)
- ✅ Hooks (useFirestore, useNotes, useLocks, etc.)
- ✅ Components (NoteCard, Toolbar, TrashBin)

### Integration Tests
- ✅ Note creation flow
- ✅ Note editing flow
- ✅ Note selection/deselection
- ✅ Canvas zoom operations
- ✅ Canvas pan operations
- ✅ Reset view functionality
- ✅ Collaboration features (presence, locks, cursors)

### What's Tested

1. **User Session Management**
   - Getting local user from localStorage
   - Creating new user
   - Reusing existing user data

2. **Firestore Hooks**
   - Notes subscription and updates
   - Locks management
   - Presence tracking
   - Cursor updates
   - CRUD operations with Firebase and localStorage fallback

3. **Components**
   - NoteCard rendering and interactions
   - Toolbar color selection and actions
   - TrashBin visual states
   - Lock overlays and read-only states

4. **Integration Flows**
   - Creating notes with color selection
   - Editing notes (title and content)
   - Selecting and deselecting notes
   - Canvas transformations (zoom, pan, reset)

## Mocking Strategy

- **Firebase**: Fully mocked to allow testing without Firebase connection
- **localStorage**: Mocked to isolate tests and prevent side effects
- **Timers**: Fake timers used for testing time-based operations
- **DOM APIs**: ResizeObserver, matchMedia, etc. are mocked

## Known Limitations

Some tests may need adjustment as the codebase evolves:
- Integration tests for drag-to-trash require complex mouse event simulation
- Full canvas coordinate transformation tests are simplified
- Some async operations may need longer timeouts in CI environments

## Adding New Tests

When adding new features:
1. Write unit tests for new utilities/hooks
2. Write component tests for new UI components
3. Add integration tests for new user flows
4. Update this README with new test coverage

