import { useContext } from 'react';
import { UserSessionContext, type UserSessionContextType } from '../context/userSessionContextDef';

export function useUserSession(): UserSessionContextType {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionProvider');
  }
  return context;
}

