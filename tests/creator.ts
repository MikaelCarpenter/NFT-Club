import * as assert from 'assert';
import * as anchor from '@project-serum/anchor';
import { expect } from 'chai';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';

// implement delete and write as if it were taking place on the frontend (1 wallet)
// OR throw everything into 1 file
describe('Creator', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;
  const creatorSeeds = [
    program.provider.wallet.publicKey.toBuffer(),
    Buffer.from('creator'),
  ];

  const endpoint = 'https://api.devnet.solana.com';
  const connection = new anchor.web3.Connection(endpoint, 'confirmed');
  let originalBalance;
  let balanceAfterCreation;

  describe('creation', () => {
    afterEach(async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const numBenefits = creatorAccount.numBenefits;

      const txn = new anchor.web3.Transaction();

      // Delete Creator
      txn.add(
        program.instruction.deleteAccount({
          accounts: {
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [],
        })
      );
      const txnSigners = [];
      await program.provider.send(txn, txnSigners);

      // Fetch Creator and check that it no longer exists
      try {
        const deletedCreator = await program.account.creator.fetch(
          creatorPubKey
        );
        console.log(deletedCreator);
      } catch (error) {
        const errorMsg =
          'Error: Account does not exist BT4EzoEr2wsrJ2RJnn73KrphGbKxP8FLyir5N4qTNcnj';
        assert.equal(error.toString(), errorMsg);
      }
    });

    it("initializes an Account and stores the creator's info", async () => {
      originalBalance = await connection.getBalance(
        program.provider.wallet.publicKey
      );
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      await program.rpc.createAccount(
        'testUsername',
        'test@email.com',
        'test description',
        {
          accounts: {
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        }
      );

      balanceAfterCreation = await connection.getBalance(
        program.provider.wallet.publicKey
      );
      expect(balanceAfterCreation).to.be.lte(originalBalance);

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);

      assert.equal(creatorAccount.username, 'testUsername');
      assert.equal(creatorAccount.email, 'test@email.com');
      assert.equal(creatorAccount.description, 'test description');
      assert.equal(creatorAccount.numBenefits, 0);
      assert.equal(
        creatorAccount.authority.toBase58(),
        program.provider.wallet.publicKey.toBase58()
      );
    });
  });

  describe('constraints', () => {
    it('cannot create a Creator with username over 42 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );
      try {
        await program.rpc.createAccount(
          'x'.repeat(43),
          'test@email.com',
          'test description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );
      try {
        await program.rpc.createAccount(
          'testUsername',
          'x'.repeat(43),
          'test description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );
      try {
        await program.rpc.createAccount(
          'testUsername',
          'test@email.com',
          'x'.repeat(421),
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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

  describe('update', () => {
    // Create account
    before(async () => {
      originalBalance = await connection.getBalance(
        program.provider.wallet.publicKey
      );
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      await program.rpc.createAccount(
        'testUsername',
        'test@email.com',
        'test description',
        {
          accounts: {
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        }
      );

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);

      assert.equal(creatorAccount.username, 'testUsername');
      assert.equal(creatorAccount.email, 'test@email.com');
      assert.equal(creatorAccount.description, 'test description');
      assert.equal(creatorAccount.numBenefits, 0);
      assert.equal(
        creatorAccount.authority.toBase58(),
        program.provider.wallet.publicKey.toBase58()
      );
    });

    // Delete account
    after(async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();

      // Delete Creator
      txn.add(
        program.instruction.deleteAccount({
          accounts: {
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [],
        })
      );
      const txnSigners = [];
      await program.provider.send(txn, txnSigners);

      // Fetch Creator and check that it no longer exists
      try {
        const deletedCreator = await program.account.creator.fetch(
          creatorPubKey
        );
        console.log(deletedCreator);
      } catch (error) {
        const errorMsg =
          'Error: Account does not exist BT4EzoEr2wsrJ2RJnn73KrphGbKxP8FLyir5N4qTNcnj';
        assert.equal(error.toString(), errorMsg);
      }
    });

    it("updates a Creator's data given its seeds", async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);

      const txn = new anchor.web3.Transaction();

      // Update Creator
      txn.add(
        program.instruction.updateAccount(
          'updatedUsername',
          'updated@email.com',
          'updated description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
        )
      );

      const txnSigners = [];
      await program.provider.send(txn, txnSigners);

      const updatedAccount = await program.account.creator.fetch(creatorPubKey);

      assert.equal(updatedAccount.username, 'updatedUsername');
      assert.equal(updatedAccount.email, 'updated@email.com');
      assert.equal(updatedAccount.description, 'updated description');

      assert.notEqual(creatorAccount.username, updatedAccount.username);
      assert.notEqual(creatorAccount.email, updatedAccount.email);
      assert.notEqual(creatorAccount.description, updatedAccount.description);
    });

    it('cannot update a Creator with username over 42 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      try {
        await program.rpc.updateAccount(
          'x'.repeat(43),
          'updated@email.com',
          'updated description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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

    it('cannot update a Creator with email over 42 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      try {
        await program.rpc.updateAccount(
          'updatedUsername',
          'x'.repeat(43),
          'updated description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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
        'The instruction should have failed with a 43-character email'
      );
    });

    it('cannot update a Creator with description over 420 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      try {
        await program.rpc.updateAccount(
          'updatedUsername',
          'updated@email.com',
          'x'.repeat(421),
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
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
        'The instruction should have failed with a 421-character description'
      );
    });
  });

  /*
  describe('deletion', () => {
    it('can delete an account and its benefits', async () => {
      const originalBalance = await connection.getBalance(creatorsWalletKeypair.publicKey);

      const creatorSeeds = [
        creatorsWalletKeypair.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const numBenefits = creatorAccount.numBenefits;

      const txn = new anchor.web3.Transaction();
      let benefitPubKeys = [];

      // Delete all Benefits of a Creator
      for (let i = 1; i <= numBenefits; i++) {
        // delete with index
        const benefitNumber = anchor.utils.bytes.utf8.encode(`${i}`);
        const benefitSeeds = [
          creatorPubKey.toBuffer(),
          anchor.utils.bytes.utf8.encode('benefit'),
          benefitNumber,
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );
        benefitPubKeys.push(benefitPubKey);

        // need separate txns to check numbenefits decrement?
        
        // Delete Benefit
        txn.add(
          program.instruction.deleteBenefit(benefitNumber, {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: creatorsWalletKeypair.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          })
        );
      }

      // Delete Creator
      txn.add(
        program.instruction.deleteAccount({
          accounts: {
            creator: creatorPubKey,
            authority: creatorsWalletKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [],
        })
      )
      const txnSigners = []
      await program.provider.send(txn, txnSigners);


      // Check if wallet balance decreases
      const balanceAfterCreation = await connection.getBalance(creatorsWalletKeypair.publicKey);
      expect(balanceAfterCreation).to.be.below(Number(originalBalance));

      // Fetch each Benefit and check that it no longer exists
      try {
        for (let i = 0; i < benefitPubKeys.length; i++) {
          const deletedBenefit = await program.account.benefit.fetch(benefitPubKeys[i]);
        }
      }
      catch(error) {
        const errorMsg = 'Error: Account does not exist 8NC7Wvx2YdsjHfX8ENkmGWRAZCKg8KUEafbajipNg7dz';
        assert.equal(error.toString(), errorMsg);
      }


      // Fetch Creator and check that it no longer exists
      try {
        const deletedCreator = await program.account.creator.fetch(creatorPubKey);
      }
      catch(error) {
        const errorMsg = 'Error: Account does not exist BT4EzoEr2wsrJ2RJnn73KrphGbKxP8FLyir5N4qTNcnj';
        assert.equal(error.toString(), errorMsg);
      }

      // Check if wallet balance increases
      const balanceAfterDeletion = connection.getBalance(creatorsWalletKeypair.publicKey);
      assert.equal(originalBalance, balanceAfterDeletion)
    });
  });
  */
});
