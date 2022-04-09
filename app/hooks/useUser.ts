import * as anchor from '@project-serum/anchor';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { useCallback, useContext, useEffect, useMemo } from 'react';

import { UserContext } from '../contexts/User';
import { IDL, NftClub } from '../../target/types/nft_club';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';
import { Creator } from '../types/Creator';
import { SubscriptionsMap } from '../types/SubscriptionsMap';

export const useUser = () => {
  const { user, setUser } = useContext(UserContext);

  const connectedWallet = useAnchorWallet();

  const program = useMemo(() => {
    if (connectedWallet) {
      const provider = new anchor.Provider(connection, connectedWallet, OPTS);

      return new anchor.Program<NftClub>(
        IDL as unknown as NftClub,
        PROGRAM_ID,
        provider
      );
    }
    return null;
  }, [connectedWallet]);

  const getCreatorAccountForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<Creator | null> => {
      const creatorSeeds = [
        wallet.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        nftClubProgram.programId
      );

      try {
        const creator = await nftClubProgram.account.creator.fetch(
          creatorPubKey
        );

        return creator;
      } catch (error) {
        // user is not a Creator... yet 😉

        return null;
      }
    },
    []
  );

  const fetchSubscriptionsForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<SubscriptionsMap> => {
      const subscriptions = await nftClubProgram.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      const newSubscriptions = await Promise.all(
        subscriptions.map((subscription) => {
          const creatorPubKey = subscription.account.creator;

          return (async () => {
            // Fetch the creator to which this subscription belongs.
            const creator = await nftClubProgram.account.creator.fetch(
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
                    nftClubProgram.programId
                  )
                )
            );

            // Fetch all benefits of this creator.
            const benefits = await Promise.all(
              benefitPubKeys.map(([pubKey]) =>
                nftClubProgram.account.benefit.fetch(pubKey)
              )
            );

            return { ...subscription, creator, benefits };
          })();
        })
      );

      const subscriptionsMap: SubscriptionsMap = {};

      newSubscriptions.forEach((sub) => {
        subscriptionsMap[sub.account.creator.toBase58()] = sub;
      });

      return subscriptionsMap;
    },
    []
  );

  const fetchUserDetails = useCallback(async () => {
    if (!program || !connectedWallet) return;

    const creator = await getCreatorAccountForUserWallet(
      program,
      connectedWallet
    );
    const subscriptions = await fetchSubscriptionsForUserWallet(
      program,
      connectedWallet
    );

    setUser({
      subscriptions,
      creatorAccount: creator,
      isLoading: false,
    });
  }, [
    program,
    connectedWallet,
    getCreatorAccountForUserWallet,
    fetchSubscriptionsForUserWallet,
    setUser,
  ]);

  useEffect(
    () => {
      if (connectedWallet && program) {
        fetchUserDetails();
      }
    },
    // Want to initialize the user once, after we have program and connectedWallet
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedWallet, program]
  );

  return {
    user,
    setUser,
    fetchUserDetails,
  };
};
