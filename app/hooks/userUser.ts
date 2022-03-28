import { createContext, useContext } from 'react';
import { Creator } from '../types/Creator';

export interface User {
  isLoading: boolean;
  creatorAccount: Creator | null;
  // TODO: Actually type this or think of better data structure
  subscriptions: Record<string, Record<string, unknown>>;
}

export interface UserState {
  user: User;
  setUser(user: User): void;
}

export const UserContext = createContext<UserState>({} as UserState);

export const useUser = (): UserState => useContext(UserContext);
