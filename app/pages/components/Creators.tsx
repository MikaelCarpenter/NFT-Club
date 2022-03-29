import { useRouter } from 'next/router';
import { FC } from 'react';

interface CreatorsType {
  creators: Record<string, unknown>[];
  isSubscribed: Record<string, Record<string, unknown>>;
}

const Creators: FC<CreatorsType> = ({ creators, isSubscribed }) => {
  const router = useRouter();
  console.log(isSubscribed);
  return (
    <div className="prose max-w-none lg:prose-xl">
      <h1 className="px-10">Creators On This Network</h1>
      <div className="grid grid-cols-1 px-10 py-5 md:grid-cols-3">
        {creators.map((creator, key) => {
          const creatorPubKey = creator.publicKey.toBase58();
          const subscription = isSubscribed[creatorPubKey];
          const subscriptionExpired = subscription
            ? subscription.account.expireTimestamp.toNumber() < Date.now()
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
                        return;
                      }
                      if (!subscriptionExpired) {
                        router.push(
                          `/creator-landing-page?creator=${creatorPubKey}`
                        );
                        return;
                      }
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
