import { useState, useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { ConfirmOptions } from '@solana/web3.js';

import IDL from '../../../target/idl/nft_club.json';
import { useUser } from '../../hooks/useUser';

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

interface Props {
  name: string;
  description: string;
  accessLink: string;
  benefitNumber: string;
}

const BenefitCard: React.FC<Props> = ({
  name,
  description,
  accessLink,
  benefitNumber,
}) => {
  const [newName, setNewName] = useState(name);
  const [newDescription, setNewDescription] = useState(description);
  const [newAccessLink, setNewAccessLink] = useState(accessLink);

  const { user, fetchUserDetails } = useUser();

  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  const updateBenefit = async () => {
    if (newName.length === 0 || newDescription.length === 0) {
      alert('A benefit must have a name or description');
      return;
    }
    if (
      newName.length > 42 ||
      newDescription.length > 420 ||
      newAccessLink.length > 420
    ) {
      alert(
        'Benefit name must be <= 42 chars and description & access link must be <= 420 chars'
      );
      return;
    }

    if (
      newName === name &&
      newDescription === description &&
      newAccessLink === accessLink
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

      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      await program.rpc.updateBenefit(
        newName,
        newDescription,
        newAccessLink,
        benefitNumber,
        {
          accounts: {
            benefit: benefitPubKey,
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        }
      );
    }
  };

  const deleteBenefit = async () => {
    console.log('DELETE');
    if (program && connectedWallet && user && user.creatorAccount) {
      const creatorSeeds = [
        connectedWallet.publicKey.toBuffer(),
        Buffer.from('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const lastBenefitNumber = `${user.creatorAccount.numBenefits}`;

      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const lastBenefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(lastBenefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const [lastBenefitPubKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          lastBenefitSeeds,
          program.programId
        );

      program.rpc.deleteBenefit(benefitNumber, lastBenefitNumber, {
        accounts: {
          benefitOld: benefitPubKey,
          benefitLast: lastBenefitPubKey,
          creator: creatorPubKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });

      fetchUserDetails(); // Refetch to update user's numBenefits
    }
  };

  return (
    <div className="prose m-4 flex flex-col rounded-xl bg-primary p-4 text-white">
      <div className="flex items-center justify-around">
        <h3 className="text-white">{benefitNumber + '.'}</h3>
        <input
          className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        ></input>

        {
          <button
            className="ml-8 w-20 rounded-xl bg-red-500 p-2"
            onClick={deleteBenefit}
          >
            Delete
          </button>
        }

        <button
          className="ml-8 w-20 rounded-xl bg-green-500 p-2"
          onClick={updateBenefit}
        >
          Save
        </button>
      </div>
      <textarea
        className="m-2 block h-3/4 w-full resize-none rounded-xl bg-slate-200 p-1 text-primary"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
      >
        {description}
      </textarea>

      <input
        className="input-value ml-2 rounded-xl bg-slate-200 p-1 text-primary"
        placeholder="Benefit access link"
        value={newAccessLink}
        onChange={(e) => setNewAccessLink(e.target.value)}
      />
    </div>
  );
};

export default BenefitCard;
