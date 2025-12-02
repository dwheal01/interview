import { useErrorNotification } from '../context/ErrorNotificationContext';

/**
 * Error Notification Toast Component
 * Displays error notifications as toast messages
 */
export function ErrorNotificationToast() {
  const { errors, dismissError } = useErrorNotification();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`
            rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right
            ${
              error.severity === 'error'
                ? 'bg-red-50 border border-red-200'
                : error.severity === 'warning'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
            }
          `}
        >
          <div className="flex-1">
            <p
              className={`
              text-sm font-medium
              ${
                error.severity === 'error'
                  ? 'text-red-800'
                  : error.severity === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
              }
            `}
            >
              {error.message}
            </p>
          </div>
          <button
            onClick={() => dismissError(error.id)}
            className={`
            text-lg font-bold leading-none
            ${
              error.severity === 'error'
                ? 'text-red-600 hover:text-red-800'
                : error.severity === 'warning'
                  ? 'text-yellow-600 hover:text-yellow-800'
                  : 'text-blue-600 hover:text-blue-800'
            }
          `}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

