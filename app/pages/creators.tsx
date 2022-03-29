import * as anchor from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import { IDL, NftClub } from '../../target/types/nft_club';
import { useCreators } from '../hooks/useCreators';
import { useUser } from '../hooks/userUser';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';
import Creators from './components/Creators';

const CreatorsPage: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const {
    user: { isSubscribed },
  } = useUser();

  const { creators, setCreators, isLoaded, setIsLoaded } = useCreators();

  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program<NftClub>(
        IDL as unknown as NftClub,
        PROGRAM_ID,
        provider
      );
    }
    return null;
  }, [connectedWallet]);

  const fetchCreators = useCallback(
    async (program: anchor.Program<NftClub>) => {
      setCreators(await program.account.creator.all());
      setIsLoaded(true);
    },
    [setCreators, setIsLoaded]
  );

  useEffect(() => {
    if (isLoaded || !program) {
      return;
    }
    fetchCreators(program);
  }, [isLoaded, program, fetchCreators]);

  console.log(creators);

  // Show different creators
  return <Creators creators={creators} isSubscribed={isSubscribed} />;
};

export default CreatorsPage;
