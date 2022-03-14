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
      const creatorsWalletKeypair = anchor.web3.Keypair.generate();
      const signature = await program.provider.connection.requestAirdrop(
        creatorsWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const creatorSeeds = [
        creatorsWalletKeypair.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      await program.rpc.createAccount(
        'testUsername',
        'test@email.com',
        'test description',
        1,
        {
          accounts: {
            creator: creatorPubKey,
            authority: creatorsWalletKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [creatorsWalletKeypair],
        }
      );

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);

      assert.equal(creatorAccount.username, 'testUsername');
      assert.equal(creatorAccount.email, 'test@email.com');
      assert.equal(creatorAccount.description, 'test description');
      assert.equal(creatorAccount.numBenefits, 1);
      assert.equal(
        creatorAccount.authority.toBase58(),
        creatorsWalletKeypair.publicKey.toBase58()
      );
    });
  });

  describe('constraints', () => {
    // defining once, because all of these requests should fail
    // so we won't have to worry about duplicates
    const creatorsWalletKeypair = anchor.web3.Keypair.generate();
    let creatorPubKey;

    before(async () => {
      const signature = await program.provider.connection.requestAirdrop(
        creatorsWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const creatorSeeds = [
        creatorsWalletKeypair.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [publicKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      creatorPubKey = publicKey;
    });

    it('cannot create a Creator with username over 42 characters', async () => {
      try {
        await program.rpc.createAccount(
          'x'.repeat(43),
          'test@email.com',
          'test description',
          1,
          {
            accounts: {
              creator: creatorPubKey,
              authority: creatorsWalletKeypair.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair],
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
        await program.rpc.createAccount(
          'testUsername',
          'x'.repeat(43),
          'test description',
          1,
          {
            accounts: {
              creator: creatorPubKey,
              authority: creatorsWalletKeypair.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair],
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
        await program.rpc.createAccount(
          'testUsername',
          'test@email.com',
          'x'.repeat(421),
          1,
          {
            accounts: {
              creator: creatorPubKey,
              authority: creatorsWalletKeypair.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair],
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
