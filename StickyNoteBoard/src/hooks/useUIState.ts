import { useContext } from 'react';
import { UIStateContext, type UIStateContextType } from '../context/uiStateContextDef';

export function useUIState(): UIStateContextType {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider');
  }
  return context;
}

