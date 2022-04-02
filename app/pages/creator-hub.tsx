import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { ConfirmOptions } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';
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

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

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

      const [benefitPubKey, bump] =
        await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );

      const newBenefit: Benefit = {
        authority: creatorPubKey,
        bump,
        description: `Benefit ${newBenefitNumber} description`,
        name: `Benefit ${newBenefitNumber} Name`,
      };

      try {
        await program.rpc.createBenefit(
          newBenefit.name,
          newBenefit.description,
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

        if (newBenefit) {
          setBenefits([...benefits, newBenefit]);
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

  const updateAccount = async () => {
    const creatorUsername = usernameRef.current
      ? usernameRef.current.value
      : '';
    const creatorDescription = descriptionRef.current
      ? descriptionRef.current.value
      : '';
    const creatorEmail = emailRef.current ? emailRef.current.value : '';

    if (creatorUsername?.length === 0 || creatorDescription?.length === 0) {
      alert('A creator must have a username or description');
      return;
    }
    if (
      creatorUsername.length > 42 ||
      creatorEmail.length > 42 ||
      creatorDescription.length > 420
    ) {
      alert(
        'Creator username and email must be <= 42 chars, and description must be <= 420 chars'
      );
      return;
    }

    if (
      creatorUsername === user.creatorAccount?.username &&
      creatorEmail === user.creatorAccount?.email &&
      creatorDescription === user.creatorAccount?.description
    ) {
      return;
    }

    if (program && connectedWallet) {
      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      try {
        await program.rpc.updateAccount(
          creatorUsername,
          creatorEmail,
          creatorDescription,
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
        );

        //TODO: DON'T fetch this: look at how benefit is handled
        const updatedAccount = await program.account.creator.fetch(
          creatorPubKey
        );
        if (updatedAccount) {
          console.log('UPDATED USER');
          console.log(updatedAccount);
          // update User
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const toggleEditCreator = (type: string) => {
    if (type === 'username') {
      setIsEditingName(!isEditingName);
    }
    if (type === 'email') {
      setIsEditingEmail(!isEditingEmail);
    }
    if (type === 'description') {
      setIsEditingDescription(!isEditingDescription);
    }
  };

  // Do all of this if a creator is found
  // All creator fields are mandatory, so extra checking should not be necessary?: Check this...
  return (
    <div className="flex h-full w-full flex-col items-center">
      {user.creatorAccount && (
        <div className="prose mb-8 w-3/5 text-center">
          <div>
            {!isEditingName ? (
              <h2 className="inline">{user.creatorAccount.username}</h2>
            ) : (
              <input
                className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                defaultValue={user.creatorAccount.username}
                ref={usernameRef}
              ></input>
            )}
            <p
              className="inline cursor-pointer pl-2 text-gray-400"
              onClick={() => toggleEditCreator('username')}
            >
              {!isEditingName ? 'Edit' : 'Cancel'}
            </p>
            <div>
              {!isEditingEmail ? (
                <p className="inline">{user.creatorAccount.email}</p>
              ) : (
                <input
                  className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                  defaultValue={user.creatorAccount.email}
                  ref={emailRef}
                ></input>
              )}
              <p
                className="inline cursor-pointer pl-2 text-gray-400"
                onClick={() => toggleEditCreator('email')}
              >
                {!isEditingEmail ? 'Edit' : 'Cancel'}
              </p>
            </div>
          </div>
          <div className="flex justify-around">
            <p>Revenue: $80000</p>
            {user.subscriptions && (
              <p>Subscribers: {user.subscriptions.length}</p>
            )}
          </div>
          <div>
            {!isEditingDescription ? (
              <p className="inline">{user.creatorAccount.description}</p>
            ) : (
              <input
                className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                defaultValue={user.creatorAccount.description}
                ref={descriptionRef}
              ></input>
            )}
            <p
              className="inline cursor-pointer pl-2 text-gray-400"
              onClick={() => toggleEditCreator('description')}
            >
              {!isEditingDescription ? 'Edit' : 'Cancel'}
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm mt-2 h-12 w-32"
            onClick={updateAccount}
          >
            Update Account
          </button>
        </div>
      )}
      {benefits && benefits.length > 0 && (
        <div className="no-scrollbar flex h-2/3 w-full flex-col items-center overflow-y-scroll rounded-xl p-2">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={`${index + 1}`}
              name={benefit.name}
              description={benefit.description}
              benefitNumber={`${index + 1}`}
            />
          ))}
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
