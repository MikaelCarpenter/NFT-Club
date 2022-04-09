import * as anchor from '@project-serum/anchor';
import { ProgramAccount } from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IDL, NftClub } from '../../target/types/nft_club';
import { CreatorsContext } from '../hooks/useCreators';
import { Creator } from '../types/Creator';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';

export interface CreatorsProviderProps {
  children: ReactNode;
}

export const CreatorsProvider: FC<CreatorsProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [creators, setCreators] = useState<ProgramAccount<Creator>[]>([]);

  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (wallet) {
      const provider = new anchor.Provider(connection, wallet, OPTS);

      return new anchor.Program<NftClub>(
        IDL as unknown as NftClub,
        PROGRAM_ID,
        provider
      );
    }
    return null;
  }, [wallet]);

  const fetchCreators = useCallback(async () => {
    if (!program) return;
    setCreators(await program.account.creator.all());
    setIsLoading(false);
  }, [setCreators, setIsLoading, program]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  return (
    <CreatorsContext.Provider
      value={{
        creators,
        isLoading,
      }}
    >
      {children}
    </CreatorsContext.Provider>
  );
};
