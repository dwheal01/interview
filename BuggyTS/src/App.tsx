import { useState } from 'react';
import type { Book } from './types/book';
import { searchBooks } from './services/bookApi';
import { addFavorite, removeFavorite, getFavorites, isFavorite } from './services/favoritesService';
import BookSearch from './components/BookSearch';
import BookList from './components/BookList';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BookDetailsModal from './components/BookDetailsModal';
import FavoritesView from './components/FavoritesView';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookKey, setSelectedBookKey] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentQuery, setCurrentQuery] = useState('');
  const [favorites, setFavorites] = useState<Book[]>(getFavorites());
  const [showFavorites, setShowFavorites] = useState(false);

  const RESULTS_PER_PAGE = 20;


  const performSearch = async (query: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedBookKey(null);

    try {
      const offset = (pageNum - 1) * RESULTS_PER_PAGE;
      const response = await searchBooks(query, RESULTS_PER_PAGE, offset);
      setBooks(response.docs);
      setTotalBooks(response.numFound);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    setPage(1);
    await performSearch(query, page);
  };

  const handleNextPage = () => {
    // Bug: Race condition - using page directly instead of functional update
    // Bug: Wrong condition - should check if we've reached the last page
    if (currentQuery && page * RESULTS_PER_PAGE < totalBooks) {
      setPage(page + 1);
      performSearch(currentQuery, page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      // Bug: Race condition - using page directly
      setPage(page - 1);
      performSearch(currentQuery, page - 1);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBookKey(book.key);
  };

  const handleCloseModal = () => {
    setSelectedBookKey(null);
  };

  const handleToggleFavorite = (book: Book) => {
    console.log("toggle favorite", book.key);
    // const isFav = favorites.some((f) => f.key === book.key);
    const isFav = isFavorite(book.key);
    if (isFav) {
      removeFavorite(book.key);
      setFavorites(getFavorites());
    } else {
      addFavorite(book);
      setFavorites(getFavorites());
    }
  };

  // Bug: Wrong condition for right arrow - should be (page - 1) * RESULTS_PER_PAGE + RESULTS_PER_PAGE < totalBooks
  const showLeftArrow = page > 1;
  const showRightArrow = page * RESULTS_PER_PAGE < totalBooks;

  const PaginationArrows = () => {
    if (!hasSearched || loading || error) return null;

    return (
      <div className="flex justify-center items-center gap-4 my-6">
        {showLeftArrow ? (
          <button
            onClick={handlePreviousPage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <span>←</span>
            <span>Previous</span>
          </button>
        ) : (
          <div className="w-24"></div>
        )}
        {showRightArrow ? (
          <button
            onClick={handleNextPage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <span>Next</span>
            <span>→</span>
          </button>
        ) : (
          <div className="w-24"></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Library Search</h1>
          <p className="text-gray-600">Search for books using the Open Library API</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !showFavorites
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showFavorites
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </div>
        </header>

        {showFavorites ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Favorite Books</h2>
            <FavoritesView
              favorites={favorites}
              onBookClick={handleBookClick}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ) : (
          <>
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
                  Displaying {(page - 1) * RESULTS_PER_PAGE + 1} - {Math.min(page * RESULTS_PER_PAGE, totalBooks)} out of {totalBooks} {totalBooks === 1 ? 'book' : 'books'}
                  {totalBooks > 0 && ` (Page ${page})`}
                </p>
              </div>
            )}

            <PaginationArrows />

            {!loading && !error && (
              <BookList
                books={books}
                onBookClick={handleBookClick}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            <PaginationArrows />
          </>
        )}

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
