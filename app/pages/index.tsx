import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../hooks/userUser';
import Loading from './components/Loading';

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const { user } = useUser();

  const { isLoading, subscriptions } = user;

<<<<<<< HEAD
  if (connectedWallet && isLoading) {
    return <Loading />;
=======
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
    ): Promise<FetchSubsReturn> => {
      const subscriptions = await nftClubProgram.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const isSubscribed: Record<string, boolean> = {};

      const newSubscriptions = await Promise.all(
        subscriptions.map((subscription) => {
          isSubscribed[subscription.account.creator.toString()] = true;

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

      return {
        subscriptions: newSubscriptions,
        isSubscribed,
      };
    },
    []
  );

  const fetchUserDetails = useCallback(
    async (nftClubProgram: anchor.Program<NftClub>, wallet: AnchorWallet) => {
      const creator = await getCreatorAccountForUserWallet(
        nftClubProgram,
        wallet
      );
      const { subscriptions, isSubscribed } =
        await fetchSubscriptionsForUserWallet(nftClubProgram, wallet);

      (creator || subscriptions.length) &&
        setUser({
          subscriptions,
          creatorAccount: creator,
          isSubscribed,
        });

      setIsLoading(false);
    },
    [getCreatorAccountForUserWallet, fetchSubscriptionsForUserWallet, setUser]
  );

  useEffect(() => {
    if (connectedWallet && program && fetchUserDetails) {
      router.push('creator-hub');
    }

    else if (connectedWallet && program) {
      setIsLoading(true);
      fetchUserDetails(program, connectedWallet);
    }
  }, [connectedWallet, program, fetchUserDetails]);

  const handleBecomeCreator = useCallback(() => {
    router.push('/sign-up');
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
>>>>>>> 4dc1f08 (progress on creator hub)
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
            <button
              className="btn btn-primary"
              onClick={() => router.push('/sign-up')}
            >
              Become a Creator
            </button>
            &nbsp; OR &nbsp;
            <button
              className="btn btn-primary"
              onClick={() => {
                Object.keys(subscriptions).length
                  ? router.push('/subscription-hub')
                  : router.push('/creator-landing-page');
              }}
            >
              {Object.keys(subscriptions).length
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
