import type { Book } from '../types/book';
import BookCard from './BookCard';

interface BookListProps {
  books: Book[];
  onBookClick?: (book: Book) => void;
}

export default function BookList({ books, onBookClick }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No books found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.key} book={book} onClick={onBookClick} />
      ))}
    </div>
  );
}

