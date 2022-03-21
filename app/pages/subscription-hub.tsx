import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/userUser';
import Subscriptions from './components/Subscriptions';

const SubscriptionHub: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const {
    user: { subscriptions },
  } = useUser();

  // Reroute to `/` if wallet not connected.
  !connectedWallet && router.push('/');

  // Reroute to `/creators` if user hasn't subscribed to any content.
  !subscriptions.length && router.push('/creators');

  // Show the different subscriptions
  return <Subscriptions subscriptions={subscriptions} />;
};

export default SubscriptionHub;
