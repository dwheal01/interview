import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorNotification {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
}

type ErrorNotificationContextType = {
  errors: ErrorNotification[];
  showError: (message: string, severity?: ErrorSeverity) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
};

const ErrorNotificationContext = createContext<ErrorNotificationContextType | null>(null);

/**
 * Error Notification Context
 * Provides a centralized way to show error messages to users
 */
export function ErrorNotificationProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorNotification[]>([]);

  const showError = useCallback((message: string, severity: ErrorSeverity = 'error') => {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const notification: ErrorNotification = {
      id,
      message,
      severity,
      timestamp: Date.now(),
    };

    setErrors((prev) => [...prev, notification]);

    // Auto-dismiss after 5 seconds for errors, 3 seconds for warnings/info
    const timeout = severity === 'error' ? 5000 : 3000;
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== id));
    }, timeout);
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorNotificationContext.Provider
      value={{
        errors,
        showError,
        dismissError,
        clearAll,
      }}
    >
      {children}
    </ErrorNotificationContext.Provider>
  );
}

export function useErrorNotification() {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within ErrorNotificationProvider');
  }
  return context;
}

