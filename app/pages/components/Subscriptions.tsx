import { useRouter } from 'next/router';
import { FC } from 'react';

interface SubscriptionsType {
  subscriptions: Record<string, unknown>[];
}

const Subscriptions: FC<SubscriptionsType> = ({ subscriptions }) => {
  const router = useRouter();

  return (
    <div>
      {subscriptions.map((subscription, key) => (
        <div className="card card-compact w-96 bg-base-100 shadow-xl" key={key}>
          <figure>
            <img
              src="https://api.lorem.space/image/shoes?w=400&h=225"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              {subscription.creator}
              {subscription.account.expireTimestamp < Date.now() ? (
                <div className="badge badge-secondary">EXPIRED</div>
              ) : (
                <div className="badge badge-accent">ACTIVE</div>
              )}
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                onClick={() =>
                  router.push(
                    `/creator-landing-page?creator=${subscription.account.creator}`
                  )
                }
              >
                Access
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Subscriptions;
