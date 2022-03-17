import * as anchor from '@project-serum/anchor';
import Layout from './components/Layout';
import { AppProps } from 'next/app';
import '../styles/globals.css';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '../hooks/userUser';
import { ConfirmOptions } from '@solana/web3.js';
import { IDL, NftClub } from '../../target/types/nft_club';

const PROGRAM_ID = new anchor.web3.PublicKey(
  '6dND1tHXuvCzB9Fe88FvnrZEqTVraPWGxtR5HQs4Z3dx'
);

const OPTS = {
  preflightCommitment: 'processed',
} as ConfirmOptions;

const endpoint = 'https://api.devnet.solana.com';

const connection = new anchor.web3.Connection(
  endpoint,
  OPTS.preflightCommitment
);

function MyApp({ Component, pageProps }: AppProps) {
  const connectedWallet = useAnchorWallet();
  const { setUser } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const getCreatorAccountForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<Record<string, unknown>> => {
      const creatorSeeds = [
        wallet.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        nftClubProgram.programId
      );

      return await nftClubProgram.account.creator.fetch(creatorPubKey);
    },
    []
  );

  const fetchSubscriptionsForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<Record<string, unknown>[]> => {
      return await nftClubProgram.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);
    },
    []
  );

  const fetchUserDetails = useCallback(
    async (nftClubProgram: anchor.Program<NftClub>, wallet: AnchorWallet) => {
      const creator = await getCreatorAccountForUserWallet(
        nftClubProgram,
        wallet
      );
      const subscriptions = await fetchSubscriptionsForUserWallet(
        nftClubProgram,
        wallet
      );

      (creator || subscriptions.length) &&
        setUser({
          subscriptions,
          creatorAccount: creator,
        });

      setIsLoading(false);
    },
    [getCreatorAccountForUserWallet, fetchSubscriptionsForUserWallet, setUser]
  );

  useEffect(() => {
    if (connectedWallet && program) {
      setIsLoading(true);
      fetchUserDetails(program, connectedWallet);
    }
  }, [connectedWallet, program, fetchUserDetails]);

  return (
    <Layout>
      {isLoading ? <div>Loading...</div> : <Component {...pageProps} />}
    </Layout>
  );
}

export default MyApp;
