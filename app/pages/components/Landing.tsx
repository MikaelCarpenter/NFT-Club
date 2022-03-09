import { Wallet } from '@project-serum/anchor';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Landing = () => {
  return (
    <>
      <div className="flex h-full bg-white text-text-primary">
        <div className="flex items-center justify-center w-1/2 text-7xl">
          <h1 className="p-12 font-sans text-center">
            Welcome
            <br />
            to <span className="text-title">NFT
            <br />
            Club.</span>
          </h1>
        </div>
        <div className="flex items-center justify-center w-1/2">
          <p className="p-16 text-center">
            Here's a big mass of text. Cool... Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool... Here's a big mass of text.
            <br />
            <br />
            We're gonna talk about how sick our product is. And you're all gonna love it.
            <br />
            <br />
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...Here's a big mass of text. Cool...Here's a big mass of text.
            Cool...
          </p>
        </div>
      </div>
      <div className="fixed rounded-xl top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-bg-primary">
        <WalletMultiButton />
      </div>
    </>
  );
};

export default Landing;
