import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useUser } from '../hooks/userUser';

const SubscriptionHub: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const { user } = useUser();

  // Reroute to `/` if wallet not connected.
  !connectedWallet && router.push('/');

  // Reroute to `/creator-landing-page` if user hasn't subscribed to any content.
  !user.subscriptions.length && router.push('/creator-landing-page');

  // TODO: Show the different subscriptions
  return null;
};

export default SubscriptionHub;
