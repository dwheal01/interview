import { useContext } from 'react';
import { AppModeContext, type AppModeContextType } from '../context/appModeContextDef';

export function useAppMode(): AppModeContextType {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}

