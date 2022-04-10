import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useUser } from '../hooks/useUser';
import Loading from './components/Loading';

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const { user } = useUser();

  const { isLoading, subscriptions } = user;

  if (connectedWallet && isLoading) {
    return <Loading />;
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
              This is an application powered by a{' '}
              <span className="font-semibold text-primary">Solana</span> Program
              to allow any creator to create a club for their fans directly,
              without a traditional platform in the middle dictating what is or
              is not allowed or taking a cut of the revenue.
              <br />
              <br />A{' '}
              <span className="font-semibold text-primary">Creator</span> can
              describe the list of{' '}
              <span className="font-semibold text-primary">Benefits</span> that
              they offer to fans. Fans can subscribe to a Creator by connecting
              their wallet and paying in SOL. Once subscribed, they will be able
              to access links provided by the Creator to access content anywhere
              on the web.
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
