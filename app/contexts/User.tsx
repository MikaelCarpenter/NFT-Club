import { FC, ReactNode, useState } from 'react';
import { User, UserContext } from '../hooks/userUser';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    creatorAccount: null,
    subscriptions: [],
  });

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
