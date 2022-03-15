import * as anchor from '@project-serum/anchor';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ConfirmOptions } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';
import { NftClub } from '../../target/types/nft_club';

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

interface User {
  creatorAccount: Record<string, unknown> | null;
  subscriptions: Record<string, unknown>[];
}

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    creatorAccount: null,
    subscriptions: [],
  });

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
        setUser((user) => {
          user.subscriptions = subscriptions as unknown as Record<
            string,
            unknown
          >[];
          user.creatorAccount = creator;
          return user;
        });
      setIsLoading(false);
    },
    [getCreatorAccountForUserWallet, fetchSubscriptionsForUserWallet]
  );

  useEffect(() => {
    if (connectedWallet && program) {
      setIsLoading(true);
      fetchUserDetails(program, connectedWallet);
    }
  }, [connectedWallet, program, fetchUserDetails]);

  const handleBecomeCreator = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="mb-16 flex flex-col items-center">
        <div className="flex">
          <div className="prose flex flex-1 items-center justify-center">
            <h1 className="text-center">
              Welcome
              <br />
              to{' '}
              <span className="text-primary">
                NFT
                <br />
                Club
              </span>
            </h1>
          </div>
          <div className="prose flex flex-1 items-center justify-center">
            <p className="p-8 text-center">
              Here's a big mass of text. Cool... Here's a big mass of text.
              Cool...Here's a big mass of text. Cool...Here's a big mass of
              text. Cool...Here's a big mass of text. Cool... Here's a big mass
              of text.
              <br />
              <br />
              We're gonna talk about how sick our product is. And you're all
              gonna love it.
            </p>
          </div>
        </div>
        {!connectedWallet ? (
          <WalletMultiButton className="btn btn-primary" />
        ) : user.creatorAccount ? (
          <p>CREATOR FOUND</p>
        ) : (
          <button className="btn btn-primary" onClick={handleBecomeCreator}>
            Become a Creator
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
