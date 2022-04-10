import { PublicKey } from '@solana/web3.js';

export type Benefit = {
  name: string;
  authority: PublicKey;
  description: string;
  accessLink: string;
  bump: number;
};
