import { createContext, useContext } from 'react';

export interface User {
  creatorAccount: Record<string, unknown> | null;
  subscriptions: Record<string, Record<string, unknown>>;
}

export interface UserState {
  user: User;
  setUser(user: User): void;
}

export const UserContext = createContext<UserState>({} as UserState);

export const useUser = (): UserState => useContext(UserContext);
