import { useState, useEffect } from 'react';
import type { BookDetails } from '../types/book';
import { getBookDetails } from '../services/bookApi';
import LoadingSpinner from './LoadingSpinner';
import { getBookCoverUrl, formatAuthors } from '../services/bookApi';
import type { Book } from '../types/book';

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
}

export default function BookDetailsModal({ book, onClose }: BookDetailsModalProps) {
  const [details, setDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBookDetails(book.key);
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [book.key]);

  const getDescription = (): string => {
    if (!details?.description) return 'No description available.';
    if (typeof details.description === 'string') {
      return details.description;
    }
    if (typeof details.description === 'object' && 'value' in details.description) {
      return details.description.value || 'No description available.';
    }
    return 'No description available.';
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading book details...</p>
          </div>
        )}

        {error && (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        )}

        {details && !loading && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{details.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex gap-6 mb-6">
              {getBookCoverUrl(details.covers?.[0]) && (
                <img
                  src={getBookCoverUrl(details.covers?.[0])!}
                  alt={details.title}
                  className="w-32 h-48 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Author(s):</span> {formatAuthors(book)}
                </p>
                {details.publish_date && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Published:</span> {details.publish_date}
                  </p>
                )}
                {details.number_of_pages && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Pages:</span> {details.number_of_pages}
                  </p>
                )}
                {details.isbn_10 && Array.isArray(details.isbn_10) && details.isbn_10.length > 0 && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">ISBN-10:</span> {details.isbn_10[0]}
                  </p>
                )}
                {details.isbn_13 && Array.isArray(details.isbn_13) && details.isbn_13.length > 0 && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">ISBN-13:</span> {details.isbn_13[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{getDescription()}</p>
            </div>

            {details.subjects && details.subjects.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {details.subjects.slice(0, 10).map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

