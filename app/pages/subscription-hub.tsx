import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@project-serum/token';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { IDL, NftClub } from '../../target/types/nft_club';
import { useUser } from '../hooks/userUser';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';
import Subscriptions from './components/Subscriptions';
import update from 'immutability-helper';
import Loading from './components/Loading';

const SubscriptionHub: NextPage = () => {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { user, setUser } = useUser();

  const { subscriptions } = user;

  const [isLoading, setIsLoading] = useState(false);

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

  const updateSubscription = useCallback(
    async (
      creatorPubKey: anchor.web3.PublicKey,
      creatorSolKey: anchor.web3.PublicKey
    ) => {
      setIsLoading(true);
      if (!wallet || !program) return;

      const subscriptionSeeds = [
        creatorPubKey.toBuffer(),
        wallet.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];
      const [subscriptionPubKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds,
          program.programId
        );

      await program.rpc.updateSubscription({
        accounts: {
          subscription: subscriptionPubKey.toBase58(),
          creator: creatorPubKey.toBase58(),
          creatorSolAccount: creatorSolKey.toBase58(),
          user: wallet.publicKey.toBase58(),
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });

      setUser(
        update(user, {
          subscriptions: {
            [creatorPubKey.toBase58()]: {
              $set: {
                account: {
                  expireTimeStamp: Date.now() / 1000 + 30 * 24 * 60 * 60,
                },
              },
            },
          },
        })
      );

      setIsLoading(false);
    },
    [program, wallet, user, setUser]
  );

  if (isLoading) {
    return <Loading />;
  }

  // Reroute to `/` if wallet not connected.
  if (!wallet) {
    router.push('/');
    return null;
  }

  // Reroute to `/creators` if user hasn't subscribed to any content.
  if (!Object.values(subscriptions).length) {
    router.push('/creators');
    return null;
  }

  // Show the different subscriptions
  return (
    <Subscriptions
      subscriptions={subscriptions}
      updateSubscription={updateSubscription}
    />
  );
};

export default SubscriptionHub;
