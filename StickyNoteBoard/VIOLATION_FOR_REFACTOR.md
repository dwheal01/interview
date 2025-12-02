Analyzing the project for design principle and practice violations. Reviewing the codebase structure and key files:


[14 tools called]


## Software design principle and practice violations

### Critical issues

#### 1. Single Responsibility Principle (SRP) violations

**App.tsx (380 lines)**
- Manages user session, UI state, canvas state, note operations, event handlers, persistence, and coordination
- Violation: Too many responsibilities in one component
- Fix: Split into:
  - `CanvasProvider` (canvas state/transform)
  - `NoteOperationsProvider` (CRUD)
  - `UserSessionProvider` (user management)
  - `AppModeProvider` (mode management)

**useFirestore.ts**
- Mixes subscriptions, CRUD, locks, presence, cursors, and localStorage fallback
- Violation: One module doing too much
- Fix: Split into:
  - `useNotesSubscription`
  - `useNoteOperations`
  - `useLocks`
  - `usePresence`
  - `useCursors`
  - Separate localStorage adapter

#### 2. Separation of concerns violations

**State management**
- Mix of Firestore subscriptions, localStorage, and component state
- No clear data flow
- Fix: Use a state management pattern (Context API, Zustand, or Redux)

**Business logic in components**
- `App.tsx` contains coordinate transforms, trash overlap detection, zoom calculations
- Fix: Extract to utilities/services:
  - `canvasUtils.ts` (coordinate transforms)
  - `collisionDetection.ts` (trash overlap)
  - `zoomUtils.ts` (zoom calculations)

#### 3. Error handling violations

**Silent failures**
```typescript
// useFirestore.ts - errors are logged but not handled
catch (error) {
  console.error('Failed to create note in Firestore:', error);
  // Falls through to localStorage - user doesn't know it failed
}
```

**No error boundaries**
- No React error boundaries
- Unhandled errors can crash the app

**Inconsistent error handling**
- Some functions return void on error, others throw, some log and continue

**Fix:**
- Add error boundaries
- Return Result types or throw consistently
- Show user-facing error messages
- Implement retry logic for network failures

#### 4. Magic numbers and hardcoded values

```typescript
// App.tsx:304
const maxY = Math.max(...notes.map(n => n.y + 176)); // 176 = w-44, should be constant

// StickyBoard.tsx:116
const noteSize = 176 * canvas.scale; // Hardcoded

// useFirestore.ts:14
const HEARTBEAT_MS = 15_000; // Good, but others missing

// App.tsx:131
const viewportHeight = window.innerHeight - 56; // Magic number (toolbar height)
```

**Fix:** Extract constants:
```typescript
const NOTE_WIDTH = 176; // w-44 in pixels
const TOOLBAR_HEIGHT = 56;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2.0;
```

#### 5. Type safety violations

**Unsafe type assertions**
```typescript
// useFirestore.ts:30
notesList.push(docSnap.data() as NoteDoc); // No validation
```

**Missing runtime validation**
- No Zod/Yup validation for Firestore data
- Invalid data can crash the app

**Fix:** Add runtime validation:
```typescript
import { z } from 'zod';
const NoteDocSchema = z.object({...});
const note = NoteDocSchema.parse(docSnap.data());
```

#### 6. Dependency injection violations

**Hard dependencies**
- Direct imports of Firebase, localStorage
- Hard to test and swap implementations

**Fix:** Use dependency injection:
```typescript
interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}
```

#### 7. Code duplication

**Coordinate transformation logic**
- Similar logic in `App.tsx` and `StickyBoard.tsx`
- Duplicate localStorage access patterns

**Fix:** Extract shared utilities

#### 8. Performance issues

**No memoization**
- `App.tsx` callbacks recreated on every render
- No `useMemo`/`useCallback` for expensive computations

**Inefficient re-renders**
- `StickyBoard` receives many props, causing unnecessary re-renders
- No React.memo on components

**Fix:**
```typescript
const onUpdateNote = useCallback(async (noteId: string, fields: Partial<NoteDoc>) => {
  // ...
}, [localUser, locks]);
```

#### 9. Security violations

**Client-side validation only**
- No server-side validation
- Firestore rules allow public read/write (mentioned in README)

**Sensitive data in localStorage**
- User IDs, usernames stored in localStorage (XSS risk)

**Fix:**
- Implement proper Firestore security rules
- Sanitize user input
- Use httpOnly cookies for sensitive data (if adding auth)

#### 10. Testing violations

**No tests**
- No unit, integration, or E2E tests
- No test utilities

**Fix:** Add:
- Unit tests for utilities
- Integration tests for hooks
- E2E tests for critical flows

#### 11. Documentation violations

**Missing JSDoc**
- Functions lack documentation
- Complex logic (coordinate transforms) not explained

**Fix:** Add JSDoc comments:
```typescript
/**
 * Converts screen coordinates to canvas coordinates accounting for
 * transform origin and current zoom/pan state.
 */
```

#### 12. Accessibility violations

**No ARIA labels**
- Interactive elements lack labels
- Keyboard navigation not fully supported

**Fix:** Add ARIA attributes and keyboard handlers

#### 13. Configuration management

**Hardcoded workspace ID**
```typescript
// firebase.ts:35
export const WORKSPACE_ID = "default";
```

**Fix:** Make configurable via environment variables

#### 14. Memory leaks potential

**Event listeners**
- Global event listeners in `App.tsx` (wheel, keydown)
- Cleanup present, but could be more robust

**setTimeout without cleanup**
```typescript
// NoteCard.tsx:52
setTimeout(() => { ... }, 100); // Not cleared on unmount
```

**Fix:** Use refs to track and clear timeouts

#### 15. State synchronization issues

**Race conditions**
- Multiple sources of truth (Firestore + localStorage)
- No conflict resolution strategy
- `isAddingModeRef` workaround indicates race condition

**Fix:** Implement proper state synchronization with conflict resolution

### Summary by severity

**Critical:**
1. No error boundaries
2. Unsafe type assertions
3. Security: public Firestore rules
4. No tests

**High:**
1. SRP violations (App.tsx too large)
2. Silent error handling
3. Magic numbers
4. No memoization (performance)

**Medium:**
1. Code duplication
2. Missing documentation
3. Hard dependencies
4. State management complexity

**Low:**
1. Accessibility issues
2. Configuration hardcoding
3. Minor memory leak risks

### Recommended refactoring priority

1. Add error boundaries and improve error handling
2. Extract business logic from `App.tsx`
3. Add runtime validation for Firestore data
4. Extract constants and remove magic numbers
5. Add memoization for performance
6. Implement proper state management
7. Add tests
8. Improve security (Firestore rules, input sanitization)

Should I create a detailed refactoring plan for any of these?