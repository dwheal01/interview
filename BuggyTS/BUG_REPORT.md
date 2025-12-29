# Bug Report - Library Search Application

## Overview
This document contains user-reported issues that need to be debugged and fixed. The bugs involve both TypeScript type issues and API integration problems.

## Reported Issues

### 1. Search Results Not Displaying Correctly
**Description:** When searching for books, sometimes the results don't show up correctly. The page might show "Displaying 1 - 0 out of X books" or the book list might be empty even when there are results.

**Steps to Reproduce:**
1. Search for a book (e.g., "javascript")
2. Check the results display
3. Navigate to different pages

**Expected:** Results should display correctly with proper counts
**Actual:** Sometimes shows incorrect counts or empty results

---

### 2. Book Details Modal Errors
**Description:** When clicking on a book to view details, sometimes the modal shows errors or doesn't display information correctly. Authors might show as empty, or the description might not render properly.

**Steps to Reproduce:**
1. Search for books
2. Click on a book card to open details
3. Check if all information displays correctly

**Expected:** All book details should display properly
**Actual:** Some fields may be missing or show errors

---

### 3. Author Names Display Issues
**Description:** Some books show author names incorrectly. You might see "[object Object]" or empty strings instead of author names.

**Steps to Reproduce:**
1. Search for books
2. Look at the author names displayed on book cards
3. Check if any show incorrectly

**Expected:** Author names should always display as readable text
**Actual:** Some books show incorrect author formatting

---

### 4. API Error Handling
**Description:** When the API returns unexpected data or errors, the application doesn't handle it gracefully. Sometimes the app crashes or shows confusing error messages.

**Steps to Reproduce:**
1. Search for books normally
2. Try edge cases (empty search, special characters, etc.)
3. Check error messages

**Expected:** Graceful error handling with clear messages
**Actual:** May crash or show unclear errors

---

### 5. Type Safety Issues
**Description:** The application sometimes has runtime errors that suggest TypeScript types aren't being properly enforced. Properties might be accessed that don't exist, or values might be the wrong type.

**Steps to Reproduce:**
1. Use the application normally
2. Check browser console for TypeScript/runtime errors
3. Look for any type-related warnings

**Expected:** No runtime type errors
**Actual:** May have type mismatches at runtime

---

### 6. Favorites Functionality
**Description:** There may be issues with how favorites are stored or retrieved. The favorites list might not persist correctly or might have type issues when saving/loading.

**Steps to Reproduce:**
1. Add books to favorites
2. Refresh the page
3. Check if favorites persist correctly

**Expected:** Favorites should persist and load correctly
**Actual:** May have issues with persistence or type mismatches

---

## Debugging Tips for Interview

1. **Check TypeScript compiler output** - Look for any type errors or warnings
2. **Use browser DevTools** - Check console for runtime errors
3. **Inspect API responses** - Verify the actual structure of API responses
4. **Check type definitions** - Ensure types match actual API responses
5. **Look for type assertions** - Find places where `as` is used and verify correctness
6. **Test edge cases** - Try empty values, null, undefined, different data shapes

## Notes
- All bugs are intentional and designed for debugging practice
- Focus on TypeScript type safety and API response handling
- Some bugs may be subtle and require careful investigation
- Use proper debugging techniques: console logs, breakpoints, type checking

