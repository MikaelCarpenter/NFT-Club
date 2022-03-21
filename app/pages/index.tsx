import * as anchor from '@project-serum/anchor';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
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

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const { user, setUser } = useUser();

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
    ): Promise<Record<string, unknown> | null> => {
      const creatorSeeds = [
        wallet.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        nftClubProgram.programId
      );

      try {
        return await nftClubProgram.account.creator.fetch(creatorPubKey);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    []
  );

  const fetchSubscriptionsForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<Record<string, unknown>[]> => {
      const subscriptions = await nftClubProgram.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      return await Promise.all(
        subscriptions.map((subscription) => {
          return (async () => {
            // Fetch the creator to which this subscription belongs.
            const creator = await nftClubProgram.account.creator.fetch(
              subscription.account.creator
            );

            // Fetch all benefit keys of this creator.
            const benefitPubKeys = await Promise.all(
              Array(creator.numBenefits)
                .fill(0)
                .map((id) =>
                  anchor.web3.PublicKey.findProgramAddress(
                    [
                      creator.authority.toBuffer(),
                      anchor.utils.bytes.utf8.encode('benefit'),
                      anchor.utils.bytes.utf8.encode(`${id + 1}`),
                    ],
                    nftClubProgram.programId
                  )
                )
            );

            // Fetch all benefits of this creator.
            const benefits = await Promise.all(
              benefitPubKeys.map(([pubKey]) =>
                nftClubProgram.account.benefit.fetch(pubKey)
              )
            );

            return { ...subscription, creator, benefits };
          })();
        })
      );
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

  const handleBecomeCreator = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          <button
            className="btn btn-primary"
            onClick={() => router.push('/creator-hub')}
          >
            Visit Creator Hub
          </button>
        ) : (
          <div>
            <button className="btn btn-primary" onClick={handleBecomeCreator}>
              Become a Creator
            </button>
            <br />
            <button
              className="btn btn-primary"
              onClick={() => {
                user.subscriptions.length
                  ? router.push('/subscription-hub')
                  : router.push('/creator-landing-page');
              }}
            >
              {user.subscriptions.length
                ? 'See my subsriptions'
                : 'Subscribe to a creator'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
