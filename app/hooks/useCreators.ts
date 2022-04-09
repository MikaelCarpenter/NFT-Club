import { ProgramAccount } from '@project-serum/anchor';
import { createContext, useContext } from 'react';
import { Creator } from '../types/Creator';

export interface CreatorsState {
  creators: ProgramAccount<Creator>[];
  isLoading: boolean;
}

export const CreatorsContext = createContext<CreatorsState>(
  {} as CreatorsState
);

export const useCreators = (): CreatorsState => useContext(CreatorsContext);
