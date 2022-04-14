import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useUser } from '../../hooks/useUser';

const Navbar = () => {
  const {
    user: { subscriptions, creatorAccount, isLoading },
  } = useUser();

  return (
    <div className="navbar z-10 h-16 bg-primary text-primary-content">
      <div className="flex-1">
        <Link href="/">NFT Club</Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal h-16 p-0">
          {!isLoading && (
            <>
              {Object.keys(subscriptions).length > 0 && (
                <li>
                  <Link href="/subscription-hub">My Subscriptions</Link>
                </li>
              )}
              {creatorAccount && (
                <li>
                  <Link href="/creator-hub">My CreatorHub</Link>
                </li>
              )}
              <li>
                <Link href="/creators">Creators</Link>
              </li>
            </>
          )}
          <li>
            <WalletMultiButton />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
