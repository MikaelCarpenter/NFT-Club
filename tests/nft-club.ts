import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';

describe('nft-club', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  it('can create a creator account', async () => {
    const creator = anchor.web3.Keypair.generate();
    const tx = await program.rpc.createAccount('testUsername', 'test@email.com', 'test description', 3, {
      accounts: {
        creator: creator.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [creator]
    });
    const creatorAccount = await program.account.creator.fetch(creator.publicKey);
    console.log("Your transaction signature", tx);
    console.log(creatorAccount);
  });
});
