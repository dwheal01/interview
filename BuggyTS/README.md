# Library Search App - TypeScript & API Integration Practice

A React application built with TypeScript, Vite, and Tailwind CSS that integrates with the Open Library API to search and display book information.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

## 📁 Project Structure

```
src/
├── types/
│   └── book.ts              # TypeScript interfaces and types
├── services/
│   └── bookApi.ts           # API integration layer
├── components/
│   ├── BookSearch.tsx       # Search input component
│   ├── BookList.tsx         # List of books
│   ├── BookCard.tsx         # Individual book card
│   ├── BookDetailsModal.tsx # Book details modal
│   ├── LoadingSpinner.tsx   # Loading state component
│   └── ErrorMessage.tsx     # Error display component
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## 🎯 Practice Areas

### TypeScript

- **Type Definitions**: Study `src/types/book.ts` to see how API responses are typed
- **Type Safety**: Notice how TypeScript prevents errors when working with API data
- **Generic Types**: Explore how to make functions more reusable with generics
- **Union Types**: See how optional properties are handled with `?` and union types

### API Integration

- **Async/Await**: Practice with `async/await` patterns in `bookApi.ts`
- **Error Handling**: Learn proper error handling for API calls
- **Response Typing**: See how to type API responses correctly
- **URL Encoding**: Notice how search queries are properly encoded

### React with TypeScript

- **Component Props**: See how props are typed with interfaces
- **State Management**: Practice with typed state using `useState<Type>`
- **Event Handlers**: Learn how to type event handlers properly
- **Custom Hooks**: Try creating custom hooks with TypeScript

## 💡 Practice Exercises

### Beginner

1. **Add a loading state** to the BookDetailsModal
2. **Add pagination** to show more results
3. **Add a favorites feature** to save books locally
4. **Improve error messages** with more specific error types

### Intermediate

1. **Create a custom hook** `useBookSearch` to extract search logic
2. **Add debouncing** to the search input
3. **Implement caching** for API responses
4. **Add unit tests** using Vitest for the API service functions
5. **Create a context** for managing book state globally

### Advanced

1. **Add infinite scroll** instead of pagination
2. **Implement optimistic updates** for favorites
3. **Add error boundaries** for better error handling
4. **Create a query builder** for advanced search filters
5. **Add TypeScript strict mode** and fix any issues
6. **Implement request cancellation** using AbortController

## 🔧 API Reference

This app uses the [Open Library API](https://openlibrary.org/developers/api):

- **Search Endpoint**: `https://openlibrary.org/search.json`
- **Book Details**: `https://openlibrary.org/{bookKey}.json`
- **Cover Images**: `https://covers.openlibrary.org/b/id/{coverId}-{size}.jpg`

## 📝 Key TypeScript Concepts Demonstrated

1. **Interface Definitions**: Strong typing for API responses
2. **Optional Properties**: Using `?` for fields that may not exist
3. **Type Guards**: Checking types at runtime
4. **Generic Functions**: Reusable utility functions
5. **Type Assertions**: When needed for API responses
6. **Union Types**: Handling different response shapes

## 🐛 Common Interview Questions to Practice

1. How would you handle API rate limiting?
2. How would you implement retry logic for failed requests?
3. How would you add request cancellation?
4. How would you type a generic API client?
5. How would you handle pagination with TypeScript?
6. How would you implement caching with TypeScript types?

## 🎨 Styling

The app uses Tailwind CSS for styling. All components are styled with utility classes.

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Open Library API Docs](https://openlibrary.org/developers/api)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
