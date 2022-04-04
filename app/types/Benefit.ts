import { PublicKey } from '@solana/web3.js';

export type Benefit = {
  authority: PublicKey;
  description: string;
  accessLink: string;
  name: string;
  bump: number;
};
