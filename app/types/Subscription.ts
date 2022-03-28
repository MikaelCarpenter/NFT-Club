import { PublicKey } from '@solana/web3.js';

export type Subscription = {
  user: PublicKey,
  creator: PublicKey,
  expiredTimestamp: number,
  bump: number,
};