import { createContext, useContext } from 'react';
import type { DevicesState } from '../context/DeviceContext';

export type DeviceContextType = {
  devices: DevicesState;
  setDevices: React.Dispatch<React.SetStateAction<DevicesState>>;
  isLoading: boolean;
};

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevices = (): DeviceContextType => {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDevices must be used within DeviceContextProvider');
  return ctx;
};

