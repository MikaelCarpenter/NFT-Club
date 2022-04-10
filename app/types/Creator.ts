import { PublicKey } from '@solana/web3.js';

export type Creator = {
  authority: PublicKey;
  username: string;
  email: string;
  description: string;
  bump: number;
  numBenefits: number;
};
