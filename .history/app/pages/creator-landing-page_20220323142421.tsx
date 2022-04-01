// benefit box component
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { useRouter } from 'next/router'
import { ConfirmOptions } from '@solana/web3.js';

import IDL from '../../target/idl/nft_club.json';


/*
  1.fetch a creator account
  2. fetch each benefit account for the creator account
  3. display the info by default (use state and render)

  4. user needs to connect their wallet
  5. if they are a subscriber we need to connect them to the benefits
  6. if they are not a subscriber, give them a button to let them subscribe and do the transaction


*/

const PROGRAM_ID = new anchor.web3.PublicKey(
  'CZeXHMniVHpEjkXTBzbpTJWR4qzgyZfRtjvviSxoUrWZ'
);

const OPTS = {
  preflightCommitment: 'processed',
} as ConfirmOptions;

const endpoint = 'https://api.devnet.solana.com';
const connection = new anchor.web3.Connection(
  endpoint,
  OPTS.preflightCommitment
);

// TODO get upload keypair from target/deploy

const fetchCreatorAccount = async () => {

  const creatorAccount = await program.account.creator.fetch(creatorPubKey);

}


const creatorLandingPage = () => {
  // const [creatorName, setCreatorName] = useState<string>('NAME');
  

  return (
    <div>
      <div className="text-center">
        <h1 className="font-medium leading-tight text-4xl mt-0 mb-2 text-black">
          NAME
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-96">
          <article className="prose-sm">
            <p className="font-light text-center text-black">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque maximus, ipsum eu dignissim consectetur, nisi nunc
              efficitur nunc, eget efficitur nunc nisi eu nunc.
            </p>
          </article>
        </div>
      </div>
      <div className="flex items-center flex-col">
        <div className="box-border my-4 h-28 w-3/5 p-2  border-2 border-black">
          <div>
            <p className="text-black top-0 left-0 font-medium">Benefit</p>
          </div>
          <div className="flex flex col items-center justify-center">
            <p className="text-black text-center">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
        <div className="box-border my-4 h-28 w-3/5 p-2  border-2 border-black">
          <div>
            <p className="text-black top-0 left-0 font-medium">Benefit</p>
          </div>
          <div className="flex flex col items-center justify-center">
            <p className="text-black text-center">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
        <div className="box-border my-4 h-28 w-3/5 p-2  border-2 border-black">
          <div>
            <p className="text-black top-0 left-0 font-medium">Benefit</p>
          </div>
          <div className="flex flex col items-center justify-center">
            <p className="text-black text-center">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
      </div>
      <div className="fixed rounded-xl top-7/8 left-1/2 transform -translate-x-1/2 -translate-y-1/4 bg-bg-primary">
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default creatorLandingPage;
