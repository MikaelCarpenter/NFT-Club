import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useUser } from '../../hooks/userUser';

const Navbar = () => {
  const {
    user: { subscriptions, isLoading },
  } = useUser();

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <Link href="/">NFT Club</Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          {!isLoading && (
            <>
              {Object.keys(subscriptions).length && (
                <li>
                  <Link href="/subscription-hub">My Subscriptions</Link>
                </li>
              )}
              {/*creatorAccount && (
                <li>
                  <Link href="/creator-hub">My CreatorHub</Link>
                </li>
              )*/}
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
