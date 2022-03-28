import * as anchor from '@project-serum/anchor';
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IDL, NftClub } from '../../target/types/nft_club';
import { User, UserContext } from '../hooks/userUser';
import { connection, OPTS, PROGRAM_ID } from '../utils/Connection';
import { Creator } from '../types/Creator';
import { Subscription } from '../types/Subscription';

export interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    creatorAccount: null,
    subscriptions: {},
    isLoading: true,
  });

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
        return await nftClubProgram.account.creator.fetch(creatorPubKey) as Creator;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    []
  );

  const fetchSubscriptionsForUserWallet = useCallback(
    async (
      nftClubProgram: anchor.Program<NftClub>,
      wallet: AnchorWallet
    ): Promise<Record<string, Record<string, unknown>>> => {
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

      const subscriptionsMap: Record<string, Record<string, unknown>> = {}

      newSubscriptions.forEach((sub) => {
        subscriptionsMap[sub.account.creator.toBase58()] = sub.account;
      });

      return subscriptionsMap;
    },
    []
  );

  const fetchUserDetails = useCallback(
    async (nftClubProgram: anchor.Program<NftClub>, wallet: AnchorWallet) => {
      const creator = await getCreatorAccountForUserWallet(
        nftClubProgram,
        wallet
      );
      const subscriptions = await fetchSubscriptionsForUserWallet(
        nftClubProgram,
        wallet
      );

      (creator || Object.values(subscriptions).length) &&
        setUser({
          subscriptions,
          creatorAccount: creator,
          isLoading: false,
        });
    },
    [getCreatorAccountForUserWallet, fetchSubscriptionsForUserWallet]
  );

  useEffect(() => {
    if (connectedWallet && program) {
      fetchUserDetails(program, connectedWallet);
    }
  }, [connectedWallet, program, fetchUserDetails]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
