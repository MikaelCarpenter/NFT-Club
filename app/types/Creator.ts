import * as anchor from '@project-serum/anchor';

export type CreatorAccount = {
  username: string;
  authority: anchor.BN;
  email: string;
  description: string;
  numBenefits: number;
  bump: number;
};
