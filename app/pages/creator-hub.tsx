import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from 'react';
import * as anchor from '@project-serum/anchor';
import { ConfirmOptions } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';

import IDL from '../../target/idl/nft_club.json';
import { ProgramAccount } from '@project-serum/anchor';
import { Creator } from '../types/Creator';
import { Benefit } from '../types/Benefit';
import { useUser } from '../hooks/userUser';

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

  const router = useRouter();
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

      const numBenefits = user.creatorAccount.numBenefits;

      const txn = new anchor.web3.Transaction();
      const benefitPubKeys = [];

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
          program!.programId
        );

        try {
          const benefit = await program!.account.benefit.fetch(benefitPubKey);
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
  }, [user]);

  useEffect(() => {
    if (connectedWallet && program && user && user.creatorAccount) {
      getBenefits();
    }
  }, [connectedWallet, program, user]);

  const [benefitRefs, setBenefitRefs] = useState<RefObject<HTMLInputElement>[]>(
    [{ current: null }]
  );

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
        <div className="no-scrollbar prose h-2/3 w-1/2 overflow-y-scroll rounded-xl p-2">
          {benefits.map((benefit, index) => (
            <div
              key={`${index + 1}`}
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
        </div>
      )}
    </div>
  );
};

export default CreatorHub;
