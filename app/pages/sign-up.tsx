import { RefObject, useCallback, useEffect, useRef, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { ConfirmOptions } from '@solana/web3.js';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../target/idl/nft_club.json';

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


const SignUp = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  useEffect(() => {
    usernameRef?.current?.focus();
  }, [usernameRef]);

  const [benefitRefs, setBenefitRefs] = useState<RefObject<HTMLInputElement>[]>(
    [{ current: null }]
  );

  const handleNewBenefit = useCallback(() => {
    setBenefitRefs((prev) => [...prev, { current: null }]);
  }, []);


  // Only call if wallet connected.
  const handleCreateAccount = useCallback(async () => {
    const username = usernameRef?.current?.value;
    const email = emailRef?.current?.value;
    const description = descriptionRef?.current?.value;

    let benefits = benefitRefs.map((benefitRef) => {
      return benefitRef?.current?.value;
    });

    // Filter out blank benefits
    benefits = benefits.filter((benefit) => benefit);
    const numBenefits = benefits.length;


    // Create account on chain
    const creatorSeeds = [
      connectedWallet!.publicKey.toBuffer(),
      anchor.utils.bytes.utf8.encode('creator'),
    ];

    const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
      creatorSeeds,
      program!.programId
    );

      //DELETE
      /*
      const creator = await program!.account.creator.fetch(creatorPubKey);
      console.log("creator", creator);
      console.log("numBenefits", numBenefits);

      const newtxn = new anchor.web3.Transaction();
      let benefitPubKeys = [];

      // Delete all Benefits of a Creator
      for (let i = 1; i <= numBenefits; i++) {
        // delete with index
        const benefitNumber = anchor.utils.bytes.utf8.encode(`${i}`);
        const benefitSeeds = [
          creatorPubKey.toBuffer(),
          anchor.utils.bytes.utf8.encode('benefit'),
          benefitNumber,
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program!.programId
        );
        benefitPubKeys.push(benefitPubKey);

        // need separate txns to check numbenefits decrement?
        
        // Delete Benefit
        newtxn.add(
          program!.instruction.deleteBenefit(benefitNumber, {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: connectedWallet!.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          })
        );
        console.log("DELETED BENEFIT");
      }

      // Delete Creator
      newtxn.add(
        program!.instruction.deleteAccount({
          accounts: {
            creator: creatorPubKey,
            authority: connectedWallet!.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [],
        })
      )
      await program!.provider.send(newtxn, []);
      console.log("DELETED");
      */
      // DONE DELETING
      // DONE DELETING

    // Create Creator account
    const txn = new anchor.web3.Transaction();
    txn.add(
      program!.instruction.createAccount(
        username!,
        email!,
        description!,
        numBenefits,
        {
          accounts: {
            creator: creatorPubKey,
            authority: connectedWallet!.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          }
        }
        // No signers necessary: wallet and pda are implicit
      )
    );

    for (let i = 0; i < numBenefits; i++) {
      const benefitNumber = anchor.utils.bytes.utf8.encode(`${i + 1}`)
      const benefitSeeds = [
        connectedWallet!.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber
      ];
      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(benefitSeeds, program!.programId);

      txn.add(
        program!.instruction.createBenefit(
          benefits[i],
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: connectedWallet!.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            // No signers necessary: wallet and pda are implicit
          }
        )
      );
    }

    await program!.provider.send(txn, []);

    const creatorAccount = await program!.account.creator.fetch(creatorPubKey);
    console.log(creatorAccount);
    console.log('creator account', creatorAccount);

    console.log('username', username);
    console.log('email', email);
    console.log('description', description);
    console.log('benefits', benefits);
    console.log('numBenefits', numBenefits);
  }, [benefitRefs]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-8 prose">
        <h1>Sign Up</h1>
      </div>
      <div className="w-full max-w-xs mb-16 form-control">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          ref={usernameRef}
          type="text"
          placeholder="Jane Doe"
          className="w-full max-w-xs mb-4 text-black input input-bordered"
          maxLength={42}
          autoFocus
        />
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          ref={emailRef}
          type="text"
          placeholder="jdoe@gmail.com"
          className="w-full max-w-xs mb-4 text-black input input-bordered"
          maxLength={42}
        />
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          ref={descriptionRef}
          className="mb-4 text-black textarea textarea-bordered"
          placeholder="Is creating..."
          maxLength={420}
        />

        <div className="flex items-center justify-between mb-4 prose">
          <h3>Benefits</h3>

          <button className="btn btn-outline btn-sm" onClick={handleNewBenefit}>
            +
          </button>
        </div>

        {benefitRefs.map((benefitRef, index) => (
          <input
            key={`benefit-${index}`}
            ref={benefitRef}
            type="text"
            placeholder="Benefit description"
            className="w-full max-w-xs mb-4 text-black input input-bordered"
            maxLength={420}
          />
        ))}

        <button className="mt-8 btn btn-primary" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default SignUp;
