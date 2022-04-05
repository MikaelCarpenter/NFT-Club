// benefit box component
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useMemo, useCallback, useEffect } from 'react';
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';

/*
  1.fetch a creator account
  2. fetch each benefit account for the creator account
  3. display the info by default (use state and render)

  4. user needs to connect their wallet
  5. if they are a subscriber we need to connect them to the benefits
  6. if they are not a subscriber, give them a button to let them subscribe and do the transaction


*/

const CreatorLandingPage = () => {
  const [benefitAccounts, updateBenefitAccount] = useState<Array<any>>([]);
  const [newCreatorAccount, setCreatorAccount] = useState<object>({});
  // useEffect hook
  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  useEffect(() => {
    if (program && connectedWallet) {
      fetchCreatorAndBenefitAccounts();
    }
  }, [connectedWallet, program]);

  const fetchCreatorAndBenefitAccounts = async () => {
    const creatorSeeds = [
      connectedWallet!.publicKey.toBuffer(),
      Buffer.from('creator'),
    ];
    const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
      creatorSeeds,
      program!.programId
    );
    console.log(creatorPubKey.toBase58());

    const creatorAccount = await program!.account.creator.fetch(creatorPubKey);
    setCreatorAccount(creatorAccount);
    const numBenefits = creatorAccount.numBenefits;

    for (let i = 0; i < numBenefits; i++) {
      const benefitNumber = Buffer.from(`${i + 1}`);
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program!.programId
      );
      const benefitAccount = await program!.account.benefit.fetch(
        benefitPubKey
      );
      if (!benefitAccounts.includes(benefitAccount)) {
        updateBenefitAccount((benefitAccounts) => [
          ...benefitAccounts,
          benefitAccount,
        ]);
      }
    }

    return benefitAccounts;
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="mt-0 mb-2 text-4xl font-medium leading-tight text-black">
          {newCreatorAccount.username}
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-96">
          <article className="prose-sm">
            <p className="text-center font-light text-black">
              {newCreatorAccount.description}
            </p>
          </article>
        </div>
      </div>
      {/* dummy benefit boxes */}
      <div className="flex flex-col items-center">
        {benefitAccounts.map((account, i) => {
          console.log(account);
          return (
            <div
              key={i + 1}
              className="my-4 box-border h-28 w-3/5 border-2  border-black p-2"
            >
              <div>
                <p className="top-0 left-0 font-medium text-black">Benefit</p>
              </div>
              <div className="col flex flex items-center justify-center">
                <p className="text-center text-black">
                  <div>
                    <p className="text-center font-light text-black">
                      {account.name}
                    </p>
                    <p className="text-center font-light text-black">
                      {account.description}
                    </p>
                  </div>
                </p>
              </div>
            </div>
          );
        })}
        {/* lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque, */}

        {/* <div className="my-4 box-border h-28 w-3/5 border-2  border-black p-2">
          <div>
            <p className="top-0 left-0 font-medium text-black">Benefit</p>
          </div>
          <div className="col flex flex items-center justify-center">
            <p className="text-center text-black">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div> */}
        {/* <div className="my-4 box-border h-28 w-3/5 border-2  border-black p-2">
          <div>
            <p className="top-0 left-0 font-medium text-black">Benefit</p>
          </div>
          <div className="col flex flex items-center justify-center">
            <p className="text-center text-black">
              lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos quaerat, doloremque,
            </p>
          </div>
        </div> */}
      </div>
      {/* dummy benefit boxes */}
      <div className="top-7/8 bg-bg-primary fixed left-1/2 -translate-x-1/2 -translate-y-1/4 transform rounded-xl">
        <WalletMultiButton />
      </div>
    </div>
  );
};
export default CreatorLandingPage;
