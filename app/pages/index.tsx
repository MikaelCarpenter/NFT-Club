import * as anchor from '@project-serum/anchor';
import { Wallet } from '@project-serum/anchor';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next';
import { ConfirmOptions } from '@solana/web3.js';
import { ProgramAccount } from '@project-serum/anchor';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';

// import IDL from '../../target/idl/counter.json';

// const PROGRAM_ID = new anchor.web3.PublicKey(
//   '7GrrqwT8xcSSM77QsnE4eTqxkBniNTsyKafTjeV6hiba'
// );

// const OPTS = {
//   preflightCommitment: 'processed',
// } as ConfirmOptions;
// const endpoint = 'https://api.devnet.solana.com';
// const connection = new anchor.web3.Connection(
//   endpoint,
//   OPTS.preflightCommitment
// );

const Home: NextPage = () => {
  const connectedWallet = useAnchorWallet();

  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [counter, setCounter] = useState<ProgramAccount | null>(null);

  // const program = useMemo(() => {
  //   if (connectedWallet) {
  //     const provider = new anchor.Provider(
  //       connection,
  //       connectedWallet as anchor.Wallet,
  //       OPTS
  //     );

  //     return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
  //   }

  //   return null;
  // }, [connectedWallet]);

  // const getCounterForUserWallet = async (
  //   counterProgram: anchor.Program,
  //   wallet: AnchorWallet
  // ) => {
  //   const [counter] = await counterProgram.account.counter.all([
  //     {
  //       memcmp: {
  //         offset: 8, // Discriminator.
  //         bytes: wallet.publicKey.toBase58(),
  //       },
  //     },
  //   ]);

  //   if (counter) setCounter(counter);
  //   setIsLoading(false);
  // };

  // useEffect(() => {
  //   if (connectedWallet && program) {
  //     setIsLoading(true);
  //     getCounterForUserWallet(program, connectedWallet);
  //   }
  // }, [connectedWallet, program]);

  return (
    <div className="flex items-center justify-center h-full">
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
          <p className="w-3/4 text-center">
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
    </div>
  );
};

export default Home;
