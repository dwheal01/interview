import { useState, useCallback, type ReactNode } from 'react';
import { ErrorNotificationContext, type ErrorNotification, type ErrorSeverity } from './errorNotificationContextDef';

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

// Hook moved to hooks/useErrorNotification.ts to satisfy Fast Refresh requirements

