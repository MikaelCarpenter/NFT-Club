import { createContext, useContext } from 'react';

export interface CreatorsState {
  creators: Record<string, unknown>[];
  isLoaded: boolean;
  setCreators(creators: Record<string, unknown>[]): void;
  setIsLoaded(loaded: boolean): void;
}

export const CreatorsContext = createContext<CreatorsState>(
  {} as CreatorsState
);

export const useCreators = (): CreatorsState => useContext(CreatorsContext);
