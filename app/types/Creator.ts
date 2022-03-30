import { PublicKey } from '@solana/web3.js';

export type Creator = {
  username: string;
  authority: PublicKey,
  email: string;
  description: string;
  numBenefits: number;
  bump: number;
};
