# State Management Refactoring Summary

## Problem
The original implementation had **separation of concerns violations** in state management:
- Mix of Firestore subscriptions, localStorage, and component state
- No clear data flow
- localStorage accessed in multiple places (CanvasContext, UserSessionContext, storageAdapter, userSession utils)
- UI state (activeColor, selectedNoteId, editingNoteId) scattered across components and hooks

## Solution
Created a unified state management architecture with clear separation of concerns:

### 1. State Persistence Service (`src/services/statePersistence.ts`)
**Purpose**: Centralizes all localStorage operations for consistent data flow

**Benefits**:
- Single source of truth for localStorage access
- Consistent error handling
- Easy to swap localStorage for another storage mechanism
- Clear API for all persistence operations

**Methods**:
- `loadCanvas()` / `saveCanvas()` - Canvas state persistence
- `loadUserSession()` / `saveUserSession()` - User session persistence
- `clearAll()` - Clear all persisted state (useful for testing/logout)

### 2. UI State Context (`src/context/UIStateContext.tsx`)
**Purpose**: Manages UI-specific state separate from business logic

**State Managed**:
- `activeColor` - Selected note color
- `selectedNoteId` - Currently selected note
- `editingNoteId` - Currently editing note

**Benefits**:
- UI state separated from business logic
- Can be easily extended for UI preferences (e.g., persist color preference)
- Clear separation of concerns

### 3. Updated Existing Contexts
**CanvasContext**: Now uses `statePersistence` service instead of direct localStorage access

**UserSessionContext**: Now uses `statePersistence` service instead of `userSession` utils

### 4. Updated Hooks
**useNoteOperations**: Now uses `UIStateContext` for `selectedNoteId` and `editingNoteId` instead of managing its own state

## Architecture

### State Flow
```
┌─────────────────────────────────────────────────────────┐
│                    State Sources                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Firestore Subscriptions (Real-time)                    │
│  ├─ Notes (useNotesSubscription)                       │
│  ├─ Locks (useLocksSubscription)                        │
│  ├─ Presence (usePresenceSubscription)                 │
│  └─ Cursors (useCursorsSubscription)                    │
│                                                          │
│  Context Providers (Application State)                   │
│  ├─ CanvasContext (canvas transform, z-index)           │
│  ├─ AppModeContext (mode, ghost position, dragging)     │
│  ├─ UserSessionContext (local user)                     │
│  └─ UIStateContext (activeColor, selection, editing)   │
│                                                          │
│  State Persistence Service (localStorage)                │
│  └─ Unified interface for all persistence               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Pattern
1. **Firestore** → Subscriptions → Context/Hooks → Components
2. **User Actions** → Hooks/Services → Firestore/localStorage → State Updates
3. **localStorage** → State Persistence Service → Contexts → Components

## Benefits

### 1. Clear Separation of Concerns ✅
- **Firestore subscriptions**: Real-time collaborative data
- **Context providers**: Application state management
- **State persistence service**: localStorage operations
- **UI state context**: UI-specific state

### 2. Consistent Data Flow ✅
- All localStorage operations go through `statePersistence` service
- Clear unidirectional data flow
- Easy to trace state changes

### 3. Maintainability ✅
- Single place to modify persistence logic
- Easy to add new persisted state
- Clear boundaries between different state types

### 4. Testability ✅
- State persistence service can be easily mocked
- Contexts can be tested independently
- Clear interfaces for state management

### 5. Extensibility ✅
- Easy to add new state to UIStateContext
- Easy to swap localStorage for API calls
- Easy to add new persistence keys

## File Structure

```
src/
├── services/
│   └── statePersistence.ts      # Unified localStorage interface
├── context/
│   ├── CanvasContext.tsx         # Canvas state (uses statePersistence)
│   ├── AppModeContext.tsx        # App mode state
│   ├── UserSessionContext.tsx    # User session (uses statePersistence)
│   └── UIStateContext.tsx        # UI state (NEW)
└── hooks/
    └── useNoteOperations.ts      # Uses UIStateContext
```

## Migration Notes

### Before
- localStorage accessed in 4+ places
- UI state in components and hooks
- No clear data flow
- Inconsistent error handling

### After
- localStorage accessed only through `statePersistence` service
- UI state in dedicated context
- Clear unidirectional data flow
- Consistent error handling

## Next Steps (Optional)

1. **Add state persistence for UI preferences** (e.g., remember activeColor)
2. **Add state versioning** for migration if localStorage schema changes
3. **Add state validation** to ensure persisted state is valid
4. **Consider adding state middleware** for logging/debugging

