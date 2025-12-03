import { createContext } from 'react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorNotification {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
}

export type ErrorNotificationContextType = {
  errors: ErrorNotification[];
  showError: (message: string, severity?: ErrorSeverity) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
};

export const ErrorNotificationContext = createContext<ErrorNotificationContextType | null>(null);

