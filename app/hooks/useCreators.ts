import { createContext, useContext } from 'react';

export interface CreatorsState {
  creators: Record<string, unknown>[];
  isLoading: boolean;
}

export const CreatorsContext = createContext<CreatorsState>(
  {} as CreatorsState
);

export const useCreators = (): CreatorsState => useContext(CreatorsContext);
