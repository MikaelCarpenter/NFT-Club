import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';
import * as assert from 'assert';

describe('nft-club', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  /*
   * Testing Creator account
   */
  it('can create a creator account', async () => {
    const creator = anchor.web3.Keypair.generate();
    const tx = await program.rpc.createAccount(
      'testUsername',
      'test@email.com',
      'test description',
      3,
      {
        accounts: {
          creator: creator.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [creator],
      }
    );
    const creatorAccount = await program.account.creator.fetch(
      creator.publicKey
    );
    console.log('Your transaction signature', tx);
    console.log(creatorAccount);
    assert.equal(creatorAccount.authority.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(creatorAccount.username, 'testUsername');
    assert.equal(creatorAccount.email, 'test@email.com');
    assert.equal(creatorAccount.description, 'test description');
    assert.equal(creatorAccount.numBenefits, 3);
  });

  it('cannot provide a username longer than 42 characters', async () => {
    try {
      console.log('INSIDE TRY');
      const creator = anchor.web3.Keypair.generate();
      await program.rpc.createAccount(
        'x'.repeat(43),
        'test@email.com',
        'test description',
        3,
        {
          accounts: {
            creator: creator.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [creator],
        }
      );
      console.log('COMPLETED TRY');
    }
    catch(error) {
      console.log('INSIDE CATCH');
      console.log(error);
      console.log('INSIDE CATCH');
      assert.equal(error.msg, 'The provided username should be 42 characters long maximum.');
      return;
    }
    console.log('REACHES ASSERT.FAIL');
    console.log('REACHES ASSERT.FAIL');
    assert.fail('The instruction should have failed with a 43-character username');
  });


  it('cannot provide an email with over 42 characters', async () => {
    try {
      const creator = anchor.web3.Keypair.generate(); // Generate a keypair for accounts (publicKey) and signers
      const emailWith43Chars = "x".repeat(43);
      await program.rpc.createAccount('testUsername', emailWith43Chars, 'test description', 3, {
        accounts: {
          creator: creator.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        },
        signers: [creator]
      });
    }
    catch(error) {
      assert.equal(error.msg, "The provided email should be 42 characters long maximum.");
      return;
    }

    assert.fail("The instruction should have failed with a 43-character email.");
  });

  it('can create a benefit account', async () => {
    console.log('CREATING BENEFIT');
    const creator = anchor.web3.Keypair.generate();
    await program.rpc.createAccount(
      'testUsername',
      'test@email.com',
      'test description',
      1,
      {
        accounts: {
          creator: creator.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [creator],
      }
    );
    const creatorAccount = await program.account.creator.fetch(
      creator.publicKey
    );
    console.log('CREATOR ACCOUNT');
    console.log(creatorAccount);
    console.log('CREATOR ACCOUNT');




    /*
     * THE BENEFIT PUBKEY SHOULD MATCH THE CREATOR'S
     * MAKE ASSERTION TO ENSURE THIS
     */
    const benefit = anchor.web3.Keypair.generate();
    const benefitTx = await program.rpc.createBenefit(
      'test description',
      {
        accounts: {
          benefit: benefit.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [benefit],
      }
    );
    const benefitAccount = await program.account.benefit.fetch(
      benefit.publicKey
    );
    console.log('Your transaction signature', benefitTx);
    assert.equal(benefitAccount.authority.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(benefitAccount.description, 'test description');
    console.log('CREATED BENEFIT');
    console.log(benefitAccount);
  });

  // Having 2 benefits for an account with 1 numBenefit should break
  // How to test and enforce this?

});
