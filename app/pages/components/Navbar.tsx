import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <div className="items-center justify-between bg-primary navbar">
      <h1 className="ml-4 text-lg font-bold">Counter</h1>
      <WalletMultiButton />
    </div>
  );
};

export default Navbar;
