// benefit box component
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useMemo, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { useRouter } from 'next/router';
import { ConfirmOptions } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import BenefitInput from './components/BenefitInput';

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
// TODO - add benefit input

const OPTS = {
  preflightCommitment: 'processed',
} as ConfirmOptions;

const endpoint = 'https://api.devnet.solana.com';
const connection = new anchor.web3.Connection(
  endpoint,
  OPTS.preflightCommitment
);

const CreatorLandingPage = () => {
  // const [creatorName, setCreatorName] = useState<string>('NAME');
  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  const fetchCreatorAndBenefitAccounts = async () => {
    const creatorSeeds = [
      connectedWallet!.publicKey.toBuffer(),
      anchor.utils.bytes.utf8.encode('creator'),
    ];

    const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
      creatorSeeds,
      program!.programId
    );

    const creatorAccount = await program!.account.creator.fetch(creatorPubKey);

    const numBenefits = creatorAccount.numBenefits;

    const benefitAccounts = [];

    for (let i = 0; i < numBenefits; i++) {
      const benefitNumber = anchor.utils.bytes.utf8.encode(`${i + 1}`);
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber,
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program!.programId
      );
      const benefitAccount = await program!.account.creator.fetch(
        benefitPubKey
      );
      benefitAccounts.push(benefitAccount);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="mt-0 mb-2 text-4xl font-medium leading-tight text-black">
          NAME
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-96">
          <article className="prose-sm">
            <p className="text-center font-light text-black">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque maximus, ipsum eu dignissim consectetur, nisi nunc
              efficitur nunc, eget efficitur nunc nisi eu nunc.
            </p>
          </article>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="my-4 box-border h-28 w-3/5 border-2  border-black p-2">
          <div>
            <p className="top-0 left-0 font-medium text-black">Benefit</p>
          </div>
          <div className="col flex flex items-center justify-center">
            <p className="text-center text-black">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
        <div className="my-4 box-border h-28 w-3/5 border-2  border-black p-2">
          <div>
            <p className="top-0 left-0 font-medium text-black">Benefit</p>
          </div>
          <div className="col flex flex items-center justify-center">
            <p className="text-center text-black">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
        <div className="my-4 box-border h-28 w-3/5 border-2  border-black p-2">
          <div>
            <p className="top-0 left-0 font-medium text-black">Benefit</p>
          </div>
          <div className="col flex flex items-center justify-center">
            <p className="text-center text-black">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div>
      </div>
      <div className="top-7/8 bg-bg-primary fixed left-1/2 -translate-x-1/2 -translate-y-1/4 transform rounded-xl">
        <WalletMultiButton />
      </div>
    </div>
  );
};
export default CreatorLandingPage;
