import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@project-serum/token';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { FC, useCallback, useMemo, useState } from 'react';
import { IDL, NftClub } from '../../../target/types/nft_club';
import { connection, OPTS, PROGRAM_ID } from '../../utils/Connection';

interface SubscriptionsType {
  subscriptions: Record<string, unknown>[];
}

const Subscriptions: FC<SubscriptionsType> = ({ subscriptions }) => {
  const router = useRouter();

  const connectedWallet = useAnchorWallet();

  const [isLoading, setIsLoading] = useState(false);

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

  const updateSubscription = useCallback(
    async (
      program: anchor.Program<NftClub>,
      creatorPubKey: anchor.web3.PublicKey,
      wallet: AnchorWallet,
      creatorSolKey: anchor.web3.PublicKey
    ) => {
      setIsLoading(true);
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
      setIsLoading(false);
    },
    []
  );

  if (isLoading) {
    return <progress className="progress w-56 place-content-center"></progress>;
  }

  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1 className="px-10">Your Subscriptions</h1>
      <div className="grid grid-cols-1 px-10 py-5 md:grid-cols-3">
        {subscriptions.map((subscription, key) => {
          const subscriptionExpired =
            subscription.account.expireTimestamp.toNumber() * 1000 < Date.now();
          return (
            <div className="card my-3 w-96 bg-base-100 shadow-xl" key={key}>
              <figure>
                <img
                  src="https://api.lorem.space/image/shoes?w=400&h=225"
                  alt="Shoes"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                  {subscription.creator.username}
                  {subscriptionExpired ? (
                    <div className="badge badge-secondary">EXPIRED</div>
                  ) : (
                    <div className="badge badge-accent">ACTIVE</div>
                  )}
                </h2>
                <p>{subscription.creator.description}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!subscriptionExpired) {
                        router.push(
                          `/creator-landing-page?creator=${subscription.account.creator.toBase58()}`
                        );
                        return;
                      }
                      connectedWallet &&
                        program &&
                        updateSubscription(
                          program,
                          subscription.account.creator,
                          connectedWallet,
                          subscription.creator.authority
                        );
                    }}
                  >
                    {subscriptionExpired ? 'Renew' : 'Access'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscriptions;
