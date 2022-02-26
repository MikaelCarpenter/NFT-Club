import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <div className="navbar items-center  justify-between">
      <h1 className="ml-4 text-lg font-bold">Counter</h1>
      <WalletMultiButton />
    </div>
  );
};

export default Navbar;
