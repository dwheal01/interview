import type { Book } from '../types/book';
import { getBookCoverUrl, formatAuthors } from '../services/bookApi';
import { isFavorite } from '../services/favoritesService';

interface BookCardProps {
  book: Book;
  onClick?: (book: Book) => void;
  onToggleFavorite?: (book: Book) => void;
}

export default function BookCard({ book, onClick, onToggleFavorite }: BookCardProps) {
  const coverUrl = getBookCoverUrl(book.cover_i);
  const authors = formatAuthors(book);
  const favorite = isFavorite(book.key);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(book);
  };

  return (
    <div
      onClick={() => onClick?.(book)}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer ${
        onClick ? 'hover:shadow-lg' : ''
      }`}
    >
      <div className="flex">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover for ${book.title}`}
            className="w-24 h-32 object-cover"
          />
        ) : (
          <div className="w-24 h-32 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">No Cover</span>
          </div>
        )}
        <div className="flex-1 p-4 relative">
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 text-2xl hover:scale-110 transition-transform"
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorite ? '❤️' : '🤍'}
            </button>
          )}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 pr-8">{book.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{authors}</p>
          {book.first_publish_year && (
            <p className="text-gray-500 text-xs">Published: {book.first_publish_year}</p>
          )}
          {book.number_of_pages_median && (
            <p className="text-gray-500 text-xs">Pages: {book.number_of_pages_median}</p>
          )}
        </div>
      </div>
    </div>
  );
}

