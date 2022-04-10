import Image from 'next/image';
import * as anchor from '@project-serum/anchor';
import { FC } from 'react';
import { useRouter } from 'next/router';
import { PublicKey } from '@solana/web3.js';
import { ProgramAccount } from '@project-serum/anchor';

import { Creator } from '../../types/Creator';
import { SubscriptionsMap } from '../../types/SubscriptionsMap';

interface CreatorsType {
  creators: ProgramAccount<Creator>[];
  subscriptions: SubscriptionsMap;
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
    <div className="flex h-full w-full flex-col items-center">
      <h1 className="prose mt-4 text-xl font-bold">Creators On This Network</h1>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto px-10 py-5 md:grid-cols-3">
        {creators.map((creator, key) => {
          const creatorPubKey = creator.publicKey.toBase58();
          const subscription = subscriptions[creatorPubKey];
          const subscriptionExpired = subscription
            ? subscription.account.expireTimestamp.toNumber() * 1000 <
              Date.now()
            : true;

          return (
            <div className="card h-max bg-base-100 shadow-xl" key={key}>
              <figure>
                <Image
                  alt="Shoes"
                  src="https://api.lorem.space/image/shoes?w=400&h=225"
                  width={400}
                  height={225}
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
                <p>{creator.account.description as string}</p>
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
