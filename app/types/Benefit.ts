import * as anchor from '@project-serum/anchor';

export type Benefit = {
  authority: anchor.BN;
  description: string;
  name: string;
  bump: number;
};
