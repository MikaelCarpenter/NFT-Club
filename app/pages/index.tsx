import * as anchor from '@project-serum/anchor';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../hooks/userUser';
import { IDL, NftClub } from '../../target/types/nft_club';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const { user, setUser } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO: use this creator landing page
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
    ): Promise<Record<string, Record<string, unknown>>> => {
      const subscriptions = await nftClubProgram.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const newSubscriptions = await Promise.all(
        subscriptions.map((subscription) => {
          const creatorPubKey = subscription.account.creator;

          return (async () => {
            // Fetch the creator to which this subscription belongs.
            const creator = await nftClubProgram.account.creator.fetch(
              creatorPubKey.toBase58()
            );
            // Fetch all benefit keys of this creator.
            const benefitPubKeys = await Promise.all(
              Array(creator.numBenefits)
                .fill(0)
                .map((_, id) =>
                  anchor.web3.PublicKey.findProgramAddress(
                    [
                      creatorPubKey.toBuffer(),
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

      const subscriptionsMap: Record<string, Record<string, unknown>> = {};

      newSubscriptions.forEach((sub) => {
        subscriptionsMap[sub.account.creator.toBase58()] = sub;
      });

      return subscriptionsMap;
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

      (creator || Object.values(subscriptions).length) &&
        setUser({
          subscriptions,
          creatorAccount: creator,
          isLoaded: true,
        });

      setIsLoading(false);
    },
    [getCreatorAccountForUserWallet, fetchSubscriptionsForUserWallet, setUser]
  );

  useEffect(() => {
    if (connectedWallet && program) {
      if (user.isLoaded) return;
      setIsLoading(true);
      fetchUserDetails(program, connectedWallet);
    }
  }, [connectedWallet, program, fetchUserDetails, user]);

  const handleBecomeCreator = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  if (isLoading) {
    return <progress className="progress w-56 place-content-center"></progress>;
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
                Object.keys(user.subscriptions).length
                  ? router.push('/subscription-hub')
                  : router.push('/creator-landing-page');
              }}
            >
              {Object.keys(user.subscriptions).length
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
