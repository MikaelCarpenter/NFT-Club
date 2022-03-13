import * as anchor from '@project-serum/anchor';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ConfirmOptions } from '@solana/web3.js';
import { ProgramAccount } from '@project-serum/anchor';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';

const PROGRAM_ID = new anchor.web3.PublicKey(
  '6dND1tHXuvCzB9Fe88FvnrZEqTVraPWGxtR5HQs4Z3dx'
);
const OPTS = {
  preflightCommitment: 'processed',
} as ConfirmOptions;

const endpoint = 'https://api.devnet.solana.com';
const connection = new anchor.web3.Connection(
  endpoint,
  OPTS.preflightCommitment
);

const Home: NextPage = () => {
  const router = useRouter();
  const connectedWallet = useAnchorWallet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [creator, setCreator] = useState<ProgramAccount | null>(null);

  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(
        connection,
        connectedWallet,
        OPTS
      );

      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  const getCreatorAccountForUserWallet = async (
    nftClubProgram: anchor.Program,
    wallet: AnchorWallet
  ) => {
    const [creator] = await nftClubProgram.account.creator.all([
      {
        memcmp: {
          offset: 8, // Discriminator.
          bytes: wallet.publicKey.toBase58(),
        },
      },
    ]);

    if (creator) setCreator(creator);
    setIsLoading(false);
  };

  useEffect(() => {
    if (connectedWallet && program) {
      setIsLoading(true);
      getCreatorAccountForUserWallet(program, connectedWallet);
    }
  }, [connectedWallet, program]);

  const handleBecomeCreator = useCallback(() => {
    router.push('/sign-up')
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className='flex flex-col items-center mb-16'>
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
            </p>
          </div>
        </div>
        {!connectedWallet ? (
          <WalletMultiButton className="btn btn-primary" />
        ) : creator ? (
          <p>CREATOR FOUND</p>
        ) : (
          <button className='btn btn-primary' onClick={handleBecomeCreator}>
            Become a Creator
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
