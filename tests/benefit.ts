import * as assert from 'assert';
import { expect } from 'chai';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';

describe('Benefit', () => {
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  const endpoint = 'https://api.devnet.solana.com';
  const connection = new anchor.web3.Connection(endpoint, 'confirmed');
  const creatorSeeds = [
    program.provider.wallet.publicKey.toBuffer(),
    Buffer.from('creator'),
  ];

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

      const benefitTxn = new anchor.web3.Transaction();
      const benefitPubKeys = [];

      // Delete all Benefits of a Creator
      for (let i = 1; i <= numBenefits; i++) {
        // delete with index
        const benefitNumber = i.toString();
        const benefitSeeds = [
          creatorPubKey.toBuffer(),
          Buffer.from('benefit'),
          Buffer.from(benefitNumber),
        ];

        const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
          benefitSeeds,
          program.programId
        );
        benefitPubKeys.push(benefitPubKey);

        // Delete Benefit
        benefitTxn.add(
          program.instruction.deleteBenefit(benefitNumber, {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          })
        );
      }

      const txnSigners = [];
      await program.provider.send(benefitTxn, txnSigners);

      // Re-fetch Creator and check that numBenefits updated
      const creatorAfterBenefitsDeleted = await program.account.creator.fetch(
        creatorPubKey
      );
      assert.equal(creatorAccount.numBenefits, numBenefits);
      assert.equal(creatorAfterBenefitsDeleted.numBenefits, 0);

      const creatorTxn = new anchor.web3.Transaction();

      // Delete Creator
      creatorTxn.add(
        program.instruction.deleteAccount({
          accounts: {
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [],
        })
      );

      await program.provider.send(creatorTxn, txnSigners);

      // Fetch each Benefit and check that it no longer exists
      try {
        for (let i = 0; i < benefitPubKeys.length; i++) {
          const deletedBenefit = await program.account.benefit.fetch(
            benefitPubKeys[i]
          );
        }
      } catch (error) {
        const errorMsg =
          'Error: Account does not exist 8NC7Wvx2YdsjHfX8ENkmGWRAZCKg8KUEafbajipNg7dz';
        assert.equal(error.toString(), errorMsg);
      }

      // Fetch Creator and check that it no longer exists
      try {
        const deletedCreator = await program.account.creator.fetch(
          creatorPubKey
        );
      } catch (error) {
        const errorMsg =
          'Error: Account does not exist BT4EzoEr2wsrJ2RJnn73KrphGbKxP8FLyir5N4qTNcnj';
        assert.equal(error.toString(), errorMsg);
      }
    });

    it('can bundle the creation of a Creator and their Benefit account', async () => {
      originalBalance = await connection.getBalance(
        program.provider.wallet.publicKey
      );

      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();
      const signers = [];

      txn.add(
        program.instruction.createAccount(
          'testUsername',
          'test@email.com',
          'test description',
          {
            accounts: {
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [],
          }
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'Benefit name',
          'benefit test description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [],
          }
        )
      );

      await program.provider.send(txn, signers);

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const benefitAccount = await program.account.benefit.fetch(benefitPubKey);

      balanceAfterCreation = await connection.getBalance(
        program.provider.wallet.publicKey
      );

      assert.equal(
        benefitAccount.authority.toBase58(),
        program.provider.wallet.publicKey.toBase58()
      );
      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorAccount.authority.toBase58()
      );
      assert.equal(benefitAccount.description, 'benefit test description');
      expect(balanceAfterCreation).to.be.below(originalBalance);
    });
  });

  describe('constraints', () => {
    it('cannot create a Benefit with description over 420 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();

      txn.add(
        program.instruction.createAccount(
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
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'Benefit name',
          'x'.repeat(421),
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
        )
      );

      try {
        await program.provider.send(txn, []);
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

  describe('update', () => {
    // Create account
    before(async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();

      txn.add(
        program.instruction.createAccount(
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
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'Benefit name',
          'benefit test description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [],
          }
        )
      );

      const txnSigners = [];
      await program.provider.send(txn, txnSigners);

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const benefitAccount = await program.account.benefit.fetch(benefitPubKey);

      balanceAfterCreation = await connection.getBalance(
        program.provider.wallet.publicKey
      );

      assert.equal(
        benefitAccount.authority.toBase58(),
        program.provider.wallet.publicKey.toBase58()
      );
      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorAccount.authority.toBase58()
      );
      assert.equal(benefitAccount.description, 'benefit test description');
      assert.equal(benefitAccount.name, 'Benefit name');

      expect(balanceAfterCreation).to.be.below(originalBalance);

      assert.equal(creatorAccount.username, 'testUsername');
      assert.equal(creatorAccount.email, 'test@email.com');
      assert.equal(creatorAccount.description, 'test description');
      assert.equal(creatorAccount.numBenefits, 1);
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

      // Delete all Benefit of a Creator
      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      // Delete Benefit
      txn.add(
        program.instruction.deleteBenefit(benefitNumber, {
          accounts: {
            benefit: benefitPubKey,
            creator: creatorPubKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        })
      );

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

    it("updates a Benefit's data given its seeds", async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const benefitAccount = await program.account.benefit.fetch(benefitPubKey);

      const txn = new anchor.web3.Transaction();

      // Update Benefit
      txn.add(
        program.instruction.updateBenefit(
          'updatedName',
          'updated description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
        )
      );

      const txnSigners = [];
      await program.provider.send(txn, txnSigners);

      const updatedBenefit = await program.account.benefit.fetch(benefitPubKey);

      assert.equal(updatedBenefit.name, 'updatedName');
      assert.equal(updatedBenefit.description, 'updated description');

      assert.notEqual(benefitAccount.username, updatedBenefit.name);
      assert.notEqual(benefitAccount.email, updatedBenefit.description);
    });

    it('cannot update a Benefit with description over 420 characters', async () => {
      const [creatorPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds,
        program.programId
      );

      const benefitNumber = '1';
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        Buffer.from('benefit'),
        Buffer.from(benefitNumber),
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();

      // Update Benefit
      txn.add(
        program.instruction.updateBenefit(
          'updatedName',
          'x'.repeat(421),
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
          }
        )
      );

      try {
        await program.provider.send(txn, []);
      } catch (error) {
        console.log('ERROR: ', error.logs);
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

  /*
  describe('deletion', () => {
    it('can delete an account and its benefits', async () => {
      const originalBalance = await connection.getBalance(creatorsWalletKeypair.publicKey);
      console.log("Original Balance", originalBalance);

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
      console.log("creator", creatorAccount);
      console.log("numBenefits", numBenefits);

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

      console.log("Finished sending transaction");

      // Check if wallet balance decreases
      const balanceAfterCreation = await connection.getBalance(creatorsWalletKeypair.publicKey);
      expect(balanceAfterCreation).to.be.below(Number(originalBalance));
      console.log(balanceAfterCreation);

      // Fetch each Benefit and check that it no longer exists
      try {
        for (let i = 0; i < benefitPubKeys.length; i++) {
          const deletedBenefit = await program.account.benefit.fetch(benefitPubKeys[i]);
          console.log(deletedBenefit);
        }
      }
      catch(error) {
        const errorMsg = 'Error: Account does not exist 8NC7Wvx2YdsjHfX8ENkmGWRAZCKg8KUEafbajipNg7dz';
        assert.equal(error.toString(), errorMsg);
      }


      // Fetch Creator and check that it no longer exists
      try {
        const deletedCreator = await program.account.creator.fetch(creatorPubKey);
        console.log(deletedCreator);
      }
      catch(error) {
        const errorMsg = 'Error: Account does not exist BT4EzoEr2wsrJ2RJnn73KrphGbKxP8FLyir5N4qTNcnj';
        assert.equal(error.toString(), errorMsg);
      }

      // Check if wallet balance increases
      const balanceAfterDeletion = connection.getBalance(creatorsWalletKeypair.publicKey);
      console.log(balanceAfterDeletion);
      assert.equal(originalBalance, balanceAfterDeletion)
    });
  });
  */
});
