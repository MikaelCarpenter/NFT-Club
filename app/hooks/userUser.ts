import { createContext, useContext } from 'react';

export interface User {
  creatorAccount: Record<string, unknown> | null;
  subscriptions: Record<string, Record<string, unknown>>;
  isLoading: boolean;
}

export interface UserState {
  user: User;
}

export const UserContext = createContext<UserState>({} as UserState);

export const useUser = (): UserState => useContext(UserContext);
