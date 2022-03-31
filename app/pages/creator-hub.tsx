import { useCallback, useEffect, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { ConfirmOptions } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';
import { ProgramAccount } from '@project-serum/anchor';
import { Creator } from '../types/Creator';
import { Benefit } from '../types/Benefit';
import { useUser } from '../hooks/userUser';
import BenefitCard from './components/BenefitCard';

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

const CreatorHub = () => {
  const { user } = useUser();
  const [benefits, setBenefits] = useState<Array<Benefit>>([]);

  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);
      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  const getBenefits = useCallback(async () => {
    if (connectedWallet && user && user.creatorAccount && program) {
      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      console.log(user.creatorAccount);
      /*
      console.log('=============================');
      const beans = await program.account.benefit.all([
        {
          memcmp: {
            offset: 8, //Discriminator
            bytes: connectedWallet.publicKey.toBase58(),
          },
        },
      ]);
      console.log(beans);
      console.log(beans[0].publicKey.toBase58());
      console.log(beans[0].account);
      console.log('=============================');
      */

      const benefitArray = [];
      for (let i = 1; i <= user.creatorAccount.numBenefits; i++) {
        const benefitNumber = `${i}`;
        const benefitSeeds = [
          creatorPubKey.toBuffer(),
          Buffer.from('benefit'),
          Buffer.from(benefitNumber),
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );

        try {
          const benefit = await program.account.benefit.fetch(benefitPubKey);
          if (benefit) {
            console.log(benefit);
            benefitArray.push(benefit as Benefit);
          }
        } catch (error) {
          console.error(error);
        }
      }
      setBenefits(benefitArray);
    }
  }, [user, connectedWallet, program]);

  const handleNewBenefit = async () => {
    if (connectedWallet && program) {
      // Get new benefit number
      // It's not this simple since we can delete a benefit in the middle...
      console.log(benefits);
      const newBenefitNumber = `${benefits.length + 1}`;

      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(newBenefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const benefitArray = benefits;

      try {
        await program.rpc.createBenefit(
          `Benefit ${newBenefitNumber} Name`,
          `Benefit ${newBenefitNumber} description`,
          newBenefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: connectedWallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            // No signers necessary: wallet and pda are implicit
          }
        );

        const newBenefit = await program.account.benefit.fetch(benefitPubKey);
        if (newBenefit) {
          benefitArray.push(newBenefit as Benefit);
          setBenefits(benefitArray);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (connectedWallet && program && user && user.creatorAccount) {
      getBenefits();
    }
  }, [connectedWallet, program, user, getBenefits]);

  // Do all of this if a creator is found
  // All creator fields are mandatory, so extra checking should not be necessary?: Check this...
  return (
    <div className="flex h-full w-full flex-col items-center">
      {user.creatorAccount && (
        <div className="prose mb-8 w-3/5 text-center">
          <h2>{user.creatorAccount.username}</h2>
          <div className="flex justify-around">
            <p>Revenue: $80000</p>
            {user.subscriptions && (
              <p>Subscribers: {user.subscriptions.length}</p>
            )}
          </div>
          <p>{user.creatorAccount.description}</p>
        </div>
      )}
      {benefits && benefits.length > 0 && (
<<<<<<< HEAD
        <div className="no-scrollbar prose h-2/3 w-1/2 overflow-y-scroll rounded-xl p-2">
=======
        <div className="no-scrollbar prose h-2/3 w-full overflow-y-scroll rounded-xl p-2">
>>>>>>> c61fddf (add update and addition of benefits on frontend; fix warnings)
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={`${index + 1}`}
<<<<<<< HEAD
              className="no-scrollbar m-4 h-1/3 overflow-y-scroll rounded-xl bg-primary p-4 text-white"
            >
              <h3 className="text-white">
                {`${index + 1}`}{' '}
                {benefit.name ? benefit.name : `Benefit ${index + 1}`}
              </h3>
              <p>{benefit.description}</p>
            </div>
          ))}
          <div className="no-scrollbar m-4 h-1/3 overflow-y-scroll rounded-xl bg-primary p-4 text-white">
            <h3>2. Benefit Name</h3>
            <p>
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
            </p>
          </div>
=======
              name={benefit.name}
              description={benefit.description}
              benefitNumber={`${index + 1}`}
            />
          ))}
>>>>>>> c61fddf (add update and addition of benefits on frontend; fix warnings)
        </div>
      )}
      <button
        className="btn btn-outline btn-sm mt-2 h-12 w-32"
        onClick={handleNewBenefit}
      >
        Add Benefit
      </button>
    </div>
  );
};

export default CreatorHub;
