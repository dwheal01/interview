import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LocalUser } from '../types';
import { getLocalUser, createLocalUser } from '../utils/userSession';

type UserSessionContextType = {
  localUser: LocalUser | null;
  showUsernameModal: boolean;
  setShowUsernameModal: (show: boolean) => void;
  handleJoin: (username: string) => void;
};

const UserSessionContext = createContext<UserSessionContextType | null>(null);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Initialize local user
  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      setLocalUser(user);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  const handleJoin = (username: string) => {
    const user = createLocalUser(username);
    setLocalUser(user);
    setShowUsernameModal(false);
  };

  return (
    <UserSessionContext.Provider
      value={{
        localUser,
        showUsernameModal,
        setShowUsernameModal,
        handleJoin,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error('useUserSession must be used within UserSessionProvider');
  }
  return context;
}

