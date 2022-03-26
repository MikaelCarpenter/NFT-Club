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
import {ProgramAccount} from '@project-serum/anchor';

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
  const [creator, setCreator] = useState<ProgramAccount | null>(null);
  const [benefits, setBenefits] = useState<Array<ProgramAccount>>([]);

  const router = useRouter();
  const connectedWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);
      return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
    }

    return null;
  }, [connectedWallet]);

  /*
  const getCreatorAccount = async () => {
    const creatorSeeds = [
      connectedWallet!.publicKey.toBuffer(),
      anchor.utils.bytes.utf8.encode('creator'),
    ];
    
    const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
      creatorSeeds,
      program!.programId
    );
    const creatorAccount = await program!.account.creator.fetch(creatorPubKey);
    if (creatorAccount) {
      setCreator(creatorAccount);
    }
  };

  useEffect(() => {
    if (connectedWallet && program) {
      getCreatorAccount();
    }
  }, [connectedWallet, program, getCreatorAccount])
  */

  const [benefitRefs, setBenefitRefs] = useState<RefObject<HTMLInputElement>[]>(
    [{ current: null }]
  );

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-3/5 mb-8 text-center prose">
        <h2>Name</h2>
        <div className="flex justify-around">
          <p>Revenue: $80000</p>
          <p>Subscribers: 15000</p>
        </div>
        <p>Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description </p>
      </div>
      <div className="w-1/2 p-2 overflow-y-scroll prose rounded-xl no-scrollbar h-2/3">
        <div className="p-4 m-4 overflow-y-scroll text-white no-scrollbar h-1/3 bg-primary rounded-xl">
          <h3>1. Benefit Name</h3>
          <p>Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description </p>
        </div>
        <div className="p-4 m-4 overflow-y-scroll text-white no-scrollbar h-1/3 bg-primary rounded-xl">
          <h3>2. Benefit Name</h3>
          <p>Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description </p>
        </div>
        <div className="p-4 m-4 overflow-y-scroll text-white no-scrollbar h-1/3 bg-primary rounded-xl">
          <h3>3. Benefit Name</h3>
          <p>Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description Benefit description </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorHub;
