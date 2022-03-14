import * as assert from 'assert';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';

describe('Benefit', () => {
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  describe('creation', () => {
    it('can bundle the creation of a Creator and their Benefit account', async () => {
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

      const benefitNumber = anchor.utils.bytes.utf8.encode('1');
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber,
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();
      const signers = [creatorsWalletKeypair];

      txn.add(
        program.instruction.createAccount(
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
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'benefit test description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey,
              creator: creatorPubKey,
              authority: creatorsWalletKeypair.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair],
          }
        )
      );

      await program.provider.send(txn, signers);

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const benefitAccount = await program.account.benefit.fetch(benefitPubKey);

      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorsWalletKeypair.publicKey.toBase58()
      );
      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorAccount.authority.toBase58()
      );
      assert.equal(benefitAccount.description, 'benefit test description');
    });
  });

  describe('constraints', () => {
    it('cannot create a Benefit with description over 420 characters', async () => {
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

      const benefitNumber = anchor.utils.bytes.utf8.encode('1');
      const benefitSeeds = [
        creatorPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber,
      ];

      const [benefitPubKey] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const txn = new anchor.web3.Transaction();
      const signers = [creatorsWalletKeypair];

      txn.add(
        program.instruction.createAccount(
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
        )
      );

      txn.add(
        program.instruction.createBenefit('x'.repeat(421), benefitNumber, {
          accounts: {
            benefit: benefitPubKey,
            creator: creatorPubKey,
            authority: creatorsWalletKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [creatorsWalletKeypair],
        })
      );

      try {
        await program.provider.send(txn, signers);
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
});
