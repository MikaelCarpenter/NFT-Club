import * as anchor from '@project-serum/anchor';
import { ConfirmOptions } from '@solana/web3.js';

export const PROGRAM_ID = new anchor.web3.PublicKey(
  'CZeXHMniVHpEjkXTBzbpTJWR4qzgyZfRtjvviSxoUrWZ'
);

export const OPTS = {
  preflightCommitment: 'processed',
} as ConfirmOptions;

const endpoint = 'https://api.devnet.solana.com';

export const connection = new anchor.web3.Connection(
  endpoint,
  OPTS.preflightCommitment
);
