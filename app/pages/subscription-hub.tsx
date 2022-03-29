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
  if (!connectedWallet) {
    router.push('/');
    return null;
  }

  // Reroute to `/creators` if user hasn't subscribed to any content.
  if (!subscriptions.length) {
    router.push('/creators');
    return null;
  }

  // Show the different subscriptions
  return <Subscriptions subscriptions={subscriptions} />;
};

export default SubscriptionHub;
