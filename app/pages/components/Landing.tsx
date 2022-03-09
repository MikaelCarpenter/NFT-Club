import { Wallet } from '@project-serum/anchor';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Landing = () => {
  return (
    <>
      <div className="flex h-full bg-primary">
        <div className="flex items-center justify-center w-1/2 text-7xl">
          <h1 className="p-12 text-center">
            Welcome
            <br />
            to NFT
            <br />
            Club.
          </h1>
        </div>
        <div className="flex items-center justify-center w-1/2">
          <p className="p-12 text-center">
            Here's a big mass of text. Cool... Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool... Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...
          </p>
        </div>
      </div>
      <div className="fixed rounded top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-500">
        <WalletMultiButton />
      </div>
    </>
  );
};

export default Landing;
