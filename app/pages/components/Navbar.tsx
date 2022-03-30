import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl normal-case">
          <Link href="/">NFT Club</Link>
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li>
            <Link href="/subscription-hub">My Subscriptions</Link>
          </li>
          <li>
            <Link href="/creators">Creators</Link>
          </li>
          <li>
            <WalletMultiButton />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
