import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  return (
    <div className="navbar items-center justify-end ">
      <button
        className="btn btn-primary"
        onClick={() => router.push('/creators')}
      >
        Creators
      </button>
      <WalletMultiButton className="btn !btn-primary" />
    </div>
  );
};

export default Navbar;
