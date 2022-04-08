import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { SubscriptionsMap } from '../../types/SubscriptionsMap';

interface SubscriptionsType {
  subscriptions: SubscriptionsMap;
  updateSubscription(
    creatorPubKey: anchor.web3.PublicKey,
    creatorSolKey: anchor.web3.PublicKey
  ): void;
}

const Subscriptions: FC<SubscriptionsType> = ({
  subscriptions,
  updateSubscription,
}) => {
  const router = useRouter();

  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1 className="px-10">Your Subscriptions</h1>
      <div className="grid grid-cols-1 px-10 py-5 md:grid-cols-3">
        {Object.values(subscriptions).map((subscription, key) => {
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
                <p>{subscription.creator.description as string}</p>
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
                      updateSubscription(
                        subscription.account.creator as PublicKey,
                        subscription.creator.authority as PublicKey
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
