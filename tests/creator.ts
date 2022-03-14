import * as assert from 'assert';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';

describe('Creator', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  describe('creation', () => {
    it("initializes an Account and stores the creator's info", async () => {
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

      assert.equal(creatorAccount.username, 'testUsername');
      assert.equal(creatorAccount.email, 'test@email.com');
      assert.equal(creatorAccount.description, 'test description');
      assert.equal(creatorAccount.numBenefits, 1);
      assert.equal(
        creatorAccount.authority.toBase58(),
        program.provider.wallet.publicKey.toBase58()
      );
    });
  });

  describe('contraints', () => {
    it('cannot create a Creator with username over 42 characters', async () => {
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

    it('cannot create a Creator with email over 42 characters', async () => {
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

    it('cannot create a Creator with description over 420 characters', async () => {
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
  });
});
