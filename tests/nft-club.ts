import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';
import * as assert from 'assert';

/*
 * Extra things that can be tested:
 * Having over 255 benefits
 */

describe('nft-club', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  /*
   * Testing Creator account
   */
  it('can create a Creator account', async () => {
    const creator = anchor.web3.Keypair.generate();
    const tx = await program.rpc.createAccount(
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
    console.log('Your transaction signature', tx);
    console.log(creatorAccount);
    assert.equal(
      creatorAccount.authority.toBase58(),
      program.provider.wallet.publicKey.toBase58()
    );
    assert.equal(creatorAccount.username, 'testUsername');
    assert.equal(creatorAccount.email, 'test@email.com');
    assert.equal(creatorAccount.description, 'test description');
    assert.equal(creatorAccount.numBenefits, 1);
  });

  it('cannot provide a Creator with username over 42 characters', async () => {
    try {
      const creator = anchor.web3.Keypair.generate();
      await program.rpc.createAccount(
        'x'.repeat(43),
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
    } catch (error) {
      assert.equal(
        error.msg,
        'The provided Creator username should be 42 characters long maximum.'
      );
      return;
    }
    assert.fail(
      'The instruction should have failed with a 43-character username'
    );
  });

  it('cannot provide a Creator with email over 42 characters', async () => {
    try {
      const creator = anchor.web3.Keypair.generate(); // Generate a keypair for accounts (publicKey) and signers
      await program.rpc.createAccount(
        'testUsername',
        'x'.repeat(43),
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
    } catch (error) {
      assert.equal(
        error.msg,
        'The provided Creator email should be 42 characters long maximum.'
      );
      return;
    }

    assert.fail(
      'The instruction should have failed with a 43-character email.'
    );
  });

  it('cannot provide a Creator with description over 420 characters', async () => {
    try {
      const creator = anchor.web3.Keypair.generate(); // Generate a keypair for accounts (publicKey) and signers
      await program.rpc.createAccount(
        'testUsername',
        'test@email.com',
        'x'.repeat(421),
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
    } catch (error) {
      assert.equal(
        error.msg,
        'The provided Creator description should be 420 characters long maximum.'
      );
      return;
    }

    assert.fail(
      'The instruction should have failed with a 421-character description.'
    );
  });

  /*
   * Testing Benefit account
   */
  it('can create a Benefit account', async () => {
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

    const benefit = anchor.web3.Keypair.generate();
    const benefitTx = await program.rpc.createBenefit(
      'benefit test description',
      {
        accounts: {
          benefit: benefit.publicKey,
          creator: creator.publicKey,
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
    assert.equal(
      benefitAccount.authority.toBase58(),
      program.provider.wallet.publicKey.toBase58()
    );
    assert.equal(
      benefitAccount.authority.toBase58(),
      creatorAccount.authority.toBase58()
    );
    assert.equal(benefitAccount.description, 'benefit test description');
    console.log(benefitAccount);
  });

  it('cannot create a Benefit with description over 421 characters', async () => {
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
    console.log(program.provider.wallet.publicKey);
    console.log(creatorAccount.authority);

    try {
      const benefit = anchor.web3.Keypair.generate();
      const benefitTx = await program.rpc.createBenefit('x'.repeat(421), {
        accounts: {
          benefit: benefit.publicKey,
          creator: creator.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [benefit],
      });
      const benefitAccount = await program.account.benefit.fetch(
        benefit.publicKey
      );
      console.log('Your transaction signature', benefitTx);
      console.log(benefitAccount);
    } catch (error) {
      assert.equal(
        error.msg,
        'The provided Benefit description should be 420 characters long maximum.'
      );
      return;
    }

    assert.fail(
      'The instruction should have failed with a 421-character benefit description.'
    );
  });
});
