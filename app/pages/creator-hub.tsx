import { useCallback, useEffect, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import update from 'immutability-helper';
import IDL from '../../target/idl/nft_club.json';
import { Benefit } from '../types/Benefit';
import { useUser } from '../hooks/userUser';
import BenefitCard from './components/BenefitCard';
import Loading from './components/Loading';
import { useRouter } from 'next/router';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';

const CreatorHub = () => {
  const { user, setUser } = useUser();
  const { creatorAccount, isLoading: isUserLoading } = user;
  const [isLoading, setIsLoading] = useState(false);
  const [benefits, setBenefits] = useState<Array<Benefit>>([]);
  const [isBenefitsLoaded, setIsBenefitsLoaded] = useState(false);
  const router = useRouter();
  const [creatorUsername, setCreatorUsername] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorDescription, setCreatorDescription] = useState('');
  const [isCreatorVarsSet, setIsCreatorsVarsSet] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);
      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  const getBenefits = useCallback(async () => {
    if (isBenefitsLoaded) return;
    if (connectedWallet && creatorAccount && program) {
      setIsLoading(true);
      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      console.log(creatorAccount);

      const benefitArray = [];
      for (let i = 1; i <= creatorAccount.numBenefits; i++) {
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
      setIsBenefitsLoaded(true);
      setIsLoading(false);
    }
  }, [creatorAccount, connectedWallet, program, isBenefitsLoaded]);

  const handleNewBenefit = useCallback(async () => {
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
          // Should re-render with new Benefits...
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [program, benefits, connectedWallet]);

  useEffect(() => {
    if (isLoading || !creatorAccount || isCreatorVarsSet) return;
    setCreatorUsername(creatorAccount.username as string);
    setCreatorEmail(creatorAccount.email as string);
    setCreatorDescription(creatorAccount.description as string);
    setIsCreatorsVarsSet(true);
  }, [isLoading, creatorAccount, isCreatorVarsSet]);

  useEffect(() => {
    if (connectedWallet && program && creatorAccount) {
      getBenefits();
    }
  }, [connectedWallet, program, creatorAccount, getBenefits]);

  const editCreator = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
      if (type === 'username') {
        setCreatorUsername(event.target.value);
      }
      if (type === 'description') {
        setCreatorDescription(event.target.value);
      }
      if (type === 'email') {
        setCreatorEmail(event.target.value);
      }
    },
    []
  );

  const updateAccount = useCallback(async () => {
    if (!creatorAccount) return;

    if (creatorUsername.length === 0 || creatorDescription.length === 0) {
      alert('A creator must have a username or description');
      return;
    }
    if (creatorUsername.length > 42 || creatorDescription.length > 420) {
      alert(
        'Creator username must be <= 42 chars and description must be <= 420 chars'
      );
      return;
    }

    if (
      creatorUsername === creatorAccount.username &&
      creatorEmail === creatorAccount.email &&
      creatorDescription === creatorAccount.description
    ) {
      return;
    }

    setIsLoading(true);

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

        const updatedAccount = await program.account.creator.fetch(
          creatorPubKey
        );
        if (updatedAccount) {
          console.log('UPDATE USER');
          console.log(updatedAccount);
          // update User
          setUser(
            update(user, {
              creatorAccount: { $set: updatedAccount },
            })
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
  }, [
    program,
    connectedWallet,
    creatorAccount,
    creatorUsername,
    creatorEmail,
    creatorDescription,
    user,
    setUser,
  ]);

  const toggleEditCreator = (type: string) => {
    if (type === 'username') {
      setEditName(!editName);
    }
    if (type === 'email') {
      setEditEmail(!editEmail);
    }
    if (type === 'description') {
      setEditDescription(!editDescription);
    }
  };

  if (isLoading || isUserLoading) return <Loading />;

  if (!creatorAccount) {
    router.push('/');
    return null;
  }

  // Do all of this if a creator is found
  // All creator fields are mandatory, so extra checking should not be necessary?: Check this...
  return (
    <div className="flex h-full w-full flex-col items-center">
      {creatorAccount && (
        <div className="prose mb-8 w-3/5 text-center">
          <div>
            {!editName ? (
              <h2 className="inline">{creatorAccount.username}</h2>
            ) : (
              <input
                className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                value={creatorUsername}
                onChange={(e) => editCreator(e, 'username')}
              ></input>
            )}
            <p
              className="inline cursor-pointer pl-2 text-gray-400"
              onClick={() => toggleEditCreator('username')}
            >
              {!editName ? 'Edit' : 'Cancel'}
            </p>
            <div>
              {!editEmail ? (
                <p className="inline">{creatorAccount.email}</p>
              ) : (
                <input
                  className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                  value={creatorEmail}
                  onChange={(e) => editCreator(e, 'email')}
                ></input>
              )}
              <p
                className="inline cursor-pointer pl-2 text-gray-400"
                onClick={() => toggleEditCreator('email')}
              >
                {!editEmail ? 'Edit' : 'Cancel'}
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
            {!editDescription ? (
              <p className="inline">{creatorAccount.description}</p>
            ) : (
              <input
                className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
                value={creatorDescription}
                onChange={(e) => editCreator(e, 'description')}
              ></input>
            )}
            <p
              className="inline cursor-pointer pl-2 text-gray-400"
              onClick={() => toggleEditCreator('description')}
            >
              {!editDescription ? 'Edit' : 'Cancel'}
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
        <div className="no-scrollbar prose h-2/3 w-full overflow-y-scroll rounded-xl p-2">
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
