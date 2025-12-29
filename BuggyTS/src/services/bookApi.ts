import type { Book, BookSearchResponse, BookDetails } from '../types/book';

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

/**
 * Fetches books from Open Library API based on search query
 * @param query - Search term for books
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Promise with book search results
 */
export async function searchBooks(
  query: string,
  limit: number = 20
): Promise<BookSearchResponse> {
  if (!query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BookSearchResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search books: ${error.message}`);
    }
    throw new Error('An unknown error occurred while searching books');
  }
}

/**
 * Fetches detailed information about a specific book
 * @param bookKey - The Open Library key for the book (e.g., "/works/OL123456W")
 * @returns Promise with detailed book information
 */
export async function getBookDetails(bookKey: string): Promise<BookDetails> {
  if (!bookKey) {
    throw new Error('Book key is required');
  }

  try {
    // Remove leading slash if present and ensure proper format
    const normalizedKey = bookKey.startsWith('/') ? bookKey : `/${bookKey}`;
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}${normalizedKey}.json`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BookDetails = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch book details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching book details');
  }
}

/**
 * Gets the cover image URL for a book
 * @param coverId - The cover ID from the book data
 * @param size - Size of the cover: 'S' (small), 'M' (medium), 'L' (large)
 * @returns URL string for the cover image
 */
export function getBookCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverId) {
    return null;
  }

  const sizeMap = {
    S: 'S',
    M: 'M',
    L: 'L',
  };

  return `https://covers.openlibrary.org/b/id/${coverId}-${sizeMap[size]}.jpg`;
}

/**
 * Formats the author names from book data
 * @param book - Book object
 * @returns Formatted author string
 */
export function formatAuthors(book: Book): string {
  if (book.author_name && book.author_name.length > 0) {
    return book.author_name.join(', ');
  }
  if (book.authors && book.authors.length > 0) {
    return book.authors.map((a) => a.name).join(', ');
  }
  return 'Unknown Author';
}

