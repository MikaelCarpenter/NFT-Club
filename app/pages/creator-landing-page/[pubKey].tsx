import * as anchor from '@project-serum/anchor';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import IDL from '../../../target/idl/nft_club.json';
import { connection, OPTS, PROGRAM_ID } from '../../utils/Connection';
import { Creator } from '../../types/Creator';
import { Benefit } from '../../types/Benefit';

const CreatorLandingPage = () => {
  const router = useRouter();
  const pubKey = router.query.pubKey;
  const connectedWallet = useAnchorWallet();

  const [benefitAccounts, setBenefitAccounts] = useState<Benefit[]>([]);
  const [creatorNotFound, setCreatorNotFound] = useState<boolean>(false);
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);

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
    // only want to fetch this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet, program]);

  const fetchCreatorAndBenefitAccounts = async () => {
    if (!program || typeof pubKey !== 'string') return;

    try {
      const creatorAccount = await program.account.creator.fetch(pubKey);

      setCurrentCreator(creatorAccount as Creator);

      const numBenefits = creatorAccount.numBenefits;
      const newPubKey = new anchor.web3.PublicKey(pubKey);

      const benefits = [];

      for (let i = 0; i < numBenefits; i++) {
        const benefitNumber = Buffer.from(`${i + 1}`);
        const benefitSeeds = [
          newPubKey.toBuffer(),
          Buffer.from('benefit'),
          Buffer.from(benefitNumber),
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );
        const benefitAccount = await program.account.benefit.fetch(
          benefitPubKey
        );

        benefits.push(benefitAccount as Benefit);
      }

      setBenefitAccounts(benefits);
    } catch (err) {
      console.log(err);
      setCreatorNotFound(true);
    }

    return benefitAccounts;
  };

  if (creatorNotFound || !currentCreator) {
    return (
      <div>
        <h1 className="text-black">Error: Creator Not Found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="mt-0 mb-2 text-4xl font-medium leading-tight text-black">
          {currentCreator.username}
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-96">
          <article className="prose-sm">
            <p className="text-center font-light text-black">
              {currentCreator.description}
            </p>
          </article>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {benefitAccounts.map((account, i) => {
          return (
            <div
              key={i + 1}
              className="my-4 box-border h-28 w-3/5 border-2  border-black p-2"
            >
              <div>
                <p className="top-0 left-0 font-medium text-black">Benefit</p>
              </div>
              <div className="col flex items-center justify-center">
                <div className="text-center text-black">
                  <p className="text-center font-light text-black">
                    {account.name}
                  </p>
                  <p className="text-center font-light text-black">
                    {account.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CreatorLandingPage;
