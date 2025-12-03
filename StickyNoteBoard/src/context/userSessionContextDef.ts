import { createContext } from 'react';
import type { LocalUser } from '../types';

export type UserSessionContextType = {
  localUser: LocalUser | null;
  showUsernameModal: boolean;
  setShowUsernameModal: (show: boolean) => void;
  handleJoin: (username: string) => void;
};

export const UserSessionContext = createContext<UserSessionContextType | null>(null);

