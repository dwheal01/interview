import { useState } from 'react';
import type { Book } from './types/book';
import { searchBooks } from './services/bookApi';
import BookSearch from './components/BookSearch';
import BookList from './components/BookList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BookDetailsModal from './components/BookDetailsModal';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedBookKey(null);

    try {
      const response = await searchBooks(query, 20);
      setBooks(response.docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBookKey(book.key);
  };

  const handleCloseModal = () => {
    setSelectedBookKey(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Library Search</h1>
          <p className="text-gray-600">Search for books using the Open Library API</p>
        </header>

        <BookSearch onSearch={handleSearch} isLoading={loading} />

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              const lastQuery = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (lastQuery?.value) {
                handleSearch(lastQuery.value);
              }
            }}
          />
        )}

        {loading && <LoadingSpinner />}

        {!loading && !error && hasSearched && (
          <div className="mb-4">
            <p className="text-gray-600">
              Found {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>
          </div>
        )}

        {!loading && !error && <BookList books={books} onBookClick={handleBookClick} />}

        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Start by searching for a book above!
            </p>
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-left">
              <h3 className="font-semibold mb-2">Try searching for:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Book titles (e.g., "The Great Gatsby")</li>
                <li>Author names (e.g., "J.K. Rowling")</li>
                <li>Subjects (e.g., "science fiction")</li>
              </ul>
            </div>
          </div>
        )}

        {selectedBookKey && (
          <BookDetailsModal bookKey={selectedBookKey} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
}

export default App;
