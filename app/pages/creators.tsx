import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@project-serum/token';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { NextPage } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IDL, NftClub } from '../../target/types/nft_club';
import { useCreators } from '../hooks/useCreators';
import { useUser } from '../hooks/userUser';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';
import Creators from './components/Creators';
import update from 'immutability-helper';

const CreatorsPage: NextPage = () => {
  const wallet = useAnchorWallet();
  const { user, setUser } = useUser();

  const { subscriptions } = user;

  const [isLoading, setIsLoading] = useState(false);

  const { creators, isLoading: isCreatorsLoading } = useCreators();

  const program = useMemo(() => {
    if (wallet) {
      const provider = new anchor.Provider(connection, wallet, OPTS);

      return new anchor.Program<NftClub>(
        IDL as unknown as NftClub,
        PROGRAM_ID,
        provider
      );
    }
    return null;
  }, [wallet]);

  const subscribeToCreator = useCallback(
    async (
      creatorPubKey: anchor.web3.PublicKey,
      creatorSolKey: anchor.web3.PublicKey
    ) => {
      if (!program || !wallet) return;
      try {
        setIsLoading(true);
        const subscriptionSeeds = [
          creatorPubKey.toBuffer(),
          wallet.publicKey.toBuffer(),
          anchor.utils.bytes.utf8.encode('subscription'),
        ];
        const [subscriptionPubKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            subscriptionSeeds,
            program.programId
          );

        await program.rpc.createSubscription({
          accounts: {
            subscription: subscriptionPubKey.toBase58(),
            creator: creatorPubKey.toBase58(),
            creatorSolAccount: creatorSolKey.toBase58(),
            user: wallet.publicKey.toBase58(),
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        });

        const subscription = await program.account.subscription.fetch(
          subscriptionPubKey.toBase58()
        );

        // Fetch the creator to which this subscription belongs.
        const creator = await program.account.creator.fetch(
          creatorPubKey.toBase58()
        );
        // Fetch all benefit keys of this creator.
        const benefitPubKeys = await Promise.all(
          Array(creator.numBenefits)
            .fill(0)
            .map((_, id) =>
              anchor.web3.PublicKey.findProgramAddress(
                [
                  creatorPubKey.toBuffer(),
                  anchor.utils.bytes.utf8.encode('benefit'),
                  anchor.utils.bytes.utf8.encode(`${id + 1}`),
                ],
                program.programId
              )
            )
        );

        // Fetch all benefits of this creator.
        const benefits = await Promise.all(
          benefitPubKeys.map(([pubKey]) =>
            program.account.benefit.fetch(pubKey)
          )
        );

        setUser(
          update(user, {
            subscriptions: {
              [creatorPubKey.toBase58()]: {
                $set: {
                  account: { ...subscription },
                  creator,
                  benefits,
                },
              },
            },
          })
        );

        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    },
    [program, wallet, user, setUser]
  );

  const updateSubscription = useCallback(
    async (
      creatorPubKey: anchor.web3.PublicKey,
      creatorSolKey: anchor.web3.PublicKey
    ) => {
      if (!program || !wallet) return;
      try {
        setIsLoading(true);
        const subscriptionSeeds = [
          creatorPubKey.toBuffer(),
          wallet.publicKey.toBuffer(),
          anchor.utils.bytes.utf8.encode('subscription'),
        ];
        const [subscriptionPubKey] =
          await anchor.web3.PublicKey.findProgramAddress(
            subscriptionSeeds,
            program.programId
          );

        await program.rpc.updateSubscription({
          accounts: {
            subscription: subscriptionPubKey.toBase58(),
            creator: creatorPubKey.toBase58(),
            creatorSolAccount: creatorSolKey.toBase58(),
            user: wallet.publicKey.toBase58(),
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        });

        setUser(
          update(user, {
            subscriptions: {
              [creatorPubKey.toBase58()]: {
                $set: {
                  account: {
                    expireTimeStamp: Date.now() / 1000 + 30 * 24 * 60 * 60,
                  },
                },
              },
            },
          })
        );

        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    },
    [program, wallet, user, setUser]
  );

  if (isLoading || isCreatorsLoading) {
    return <progress className="progress w-56 place-content-center"></progress>;
  }

  // Show different creators
  return (
    <Creators
      creators={creators}
      subscriptions={subscriptions}
      subscribeToCreator={subscribeToCreator}
      updateSubscription={updateSubscription}
    />
  );
};

export default CreatorsPage;
