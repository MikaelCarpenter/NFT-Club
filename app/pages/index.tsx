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
  console.log('connectedWallet', connectedWallet);

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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex">
        <div className="prose flex flex-1 items-center justify-center">
          <h1 className="text-center">
            Welcome
            <br />
            to <span className="text-primary">NFT
            <br />
            Club</span>
          </h1>
        </div>
        <div className="prose flex flex-1 items-center justify-center">
          <p className="text-center p-8">
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
      <WalletMultiButton className="btn-primary" />
    </div>
  );
};

export default Home;
