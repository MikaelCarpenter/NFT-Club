import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from 'react';
import * as anchor from '@project-serum/anchor';
import { ConfirmOptions, PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';

import IDL from '../../target/idl/nft_club.json';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';

const SignUp = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

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

    if (connectedWallet && program && email && username && description) {
      const benefits = benefitRefs
        .map((benefitRef) => {
          return benefitRef?.current?.value;
        })
        .filter((benefit) => benefit);
      const numBenefits = benefits.length;

      // Create account on chain
      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      // Create Creator account
      const txn = new anchor.web3.Transaction();
      txn.add(
        program.instruction.createAccount(
          username,
          email,
          description,
          {
            accounts: {
              creator: creatorPubKey,
              authority: connectedWallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
          // No signers necessary: wallet and pda are implicit
        )
      );

      // Create Benefit accounts
      for (let i = 0; i < numBenefits; i++) {
        const benefitNumber = `${i + 1}`;
        const benefitSeeds = [
          creatorPubKey.toBuffer(),
          Buffer.from('benefit'),
          Buffer.from(benefitNumber),
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );

        txn.add(
          program.instruction.createBenefit(
            'Benefit Name',
            benefits[i],
            '', // access_link
            benefitNumber,
            {
              accounts: {
                benefit: benefitPubKey,
                creator: creatorPubKey,
                authority: connectedWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
              },
              // No signers necessary: wallet and pda are implicit
            }
          )
        );
      }

      await program.provider.send(txn, []);
      router.push('/creator-hub');
    }

    router.push('/creator-hub');
  }, [benefitRefs, connectedWallet, program, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="prose mb-8">
        <h1>Sign Up</h1>
      </div>
      <div className="form-control mb-16 w-full max-w-xs">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          ref={usernameRef}
          type="text"
          placeholder="Jane Doe"
          className="input input-bordered mb-4 w-full max-w-xs text-black"
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
          className="input input-bordered mb-4 w-full max-w-xs text-black"
          maxLength={42}
        />
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          ref={descriptionRef}
          className="textarea textarea-bordered mb-4 text-black"
          placeholder="Is creating..."
          maxLength={420}
        />

        <div className="prose mb-4 flex items-center justify-between">
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
            className="input input-bordered mb-4 w-full max-w-xs text-black"
            maxLength={420}
          />
        ))}

        <button className="btn btn-primary mt-8" onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
};

export default SignUp;
