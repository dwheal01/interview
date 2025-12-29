import type { Book } from '../types/book';
import BookCard from './BookCard';

interface FavoritesViewProps {
  favorites: Book[];
  onBookClick: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
}

export default function FavoritesView({ favorites, onBookClick, onToggleFavorite }: FavoritesViewProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No favorite books yet. Start adding some!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((book) => (
        <BookCard
          key={book.key}
          book={book}
          onClick={onBookClick}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

