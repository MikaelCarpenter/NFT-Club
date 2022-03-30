import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { FC } from 'react';

interface CreatorsType {
  creators: Record<string, unknown>[];
  subscriptions: Record<string, Record<string, unknown>>;
  subscribeToCreator(
    creatorPubKey: anchor.web3.PublicKey,
    creatorSolKey: anchor.web3.PublicKey
  ): void;
  updateSubscription(
    creatorPubKey: anchor.web3.PublicKey,
    creatorSolKey: anchor.web3.PublicKey
  ): void;
}

const Creators: FC<CreatorsType> = ({
  creators,
  subscriptions,
  subscribeToCreator,
  updateSubscription,
}) => {
  const router = useRouter();

  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1 className="px-10">Creators On This Network</h1>
      <div className="grid grid-cols-1 px-10 py-5 md:grid-cols-3">
        {creators.map((creator, key) => {
          const creatorPubKey = creator.publicKey.toBase58();
          const subscription = subscriptions[creatorPubKey];
          const subscriptionExpired = subscription
            ? subscription.account.expireTimestamp.toNumber() * 1000 <
              Date.now()
            : true;
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
                  {creator.account.username}
                  {subscription &&
                    (subscriptionExpired ? (
                      <div className="badge badge-secondary">EXPIRED</div>
                    ) : (
                      <div className="badge badge-accent">ACTIVE</div>
                    ))}
                </h2>
                <p>{creator.account.description}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!subscription) {
                        subscribeToCreator(
                          creator.publicKey as PublicKey,
                          creator.account.authority as PublicKey
                        );
                        return;
                      }
                      if (!subscriptionExpired) {
                        router.push(
                          `/creator-landing-page?creator=${creatorPubKey}`
                        );
                        return;
                      }
                      updateSubscription(
                        creator.publicKey as PublicKey,
                        creator.account.authority as PublicKey
                      );
                    }}
                  >
                    {subscription
                      ? subscriptionExpired
                        ? 'Renew'
                        : 'Access'
                      : 'Subscribe'}
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

export default Creators;
