import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <div className="navbar items-center justify-end ">
      <WalletMultiButton className="btn !btn-primary" />
    </div>
  );
};

export default Navbar;
