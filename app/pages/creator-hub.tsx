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
    const creatorSeeds = [
      user.creatorAccount.authority.toBuffer(),
      anchor.utils.bytes.utf8.encode('creator'),
    ];
    const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
      creatorSeeds,
      program!.programId
    );

    for (let i = 1; i <= user.creatorAccount.numBenefits; i++) {
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

      try {
        const benefit = await program!.account.benefit.fetch(benefitPubKey);
        if (benefit) {
          const benefitsCopy = benefits;
          benefitsCopy.push(benefit as Benefit);
          setBenefits(benefitsCopy);
        }
      } catch (error) {
        console.error(error);
      }
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
          <h2>Name</h2>
          <div className="flex justify-around">
            <p>Revenue: $80000</p>
            <p>Subscribers: 15000</p>
          </div>
          <p>
            Description Description Description Description Description
            Description Description Description Description Description
            Description Description Description Description Description
            Description Description Description Description{' '}
          </p>
        </div>
      )}
      {benefits && (
        <div className="no-scrollbar prose h-2/3 w-1/2 overflow-y-scroll rounded-xl p-2">
          {benefits.map((benefit, index) => (
            <div
              key={`${index + 1}`}
              className="no-scrollbar m-4 h-1/3 overflow-y-scroll rounded-xl bg-primary p-4 text-white"
            >
              <h3>
                {`${index}`} {benefit.name ? benefit.name : `Benefit ${index}`}
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
              Benefit description Benefit description Benefit description
              Benefit description Benefit description Benefit description
            </p>
          </div>
          <h3>3. Benefit Name</h3>
          <p>
            Benefit description Benefit description Benefit descriptioBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionBenefit
            description Benefit description Benefit descriptionnBenefit
            description Benefit description Benefit description
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatorHub;
