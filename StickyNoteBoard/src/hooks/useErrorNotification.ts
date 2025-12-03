import { useContext } from 'react';
import { ErrorNotificationContext, type ErrorNotificationContextType } from '../context/errorNotificationContextDef';

export function useErrorNotification(): ErrorNotificationContextType {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within ErrorNotificationProvider');
  }
  return context;
}

