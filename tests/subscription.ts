import * as assert from 'assert';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftClub } from '../target/types/nft_club';
import { TOKEN_PROGRAM_ID } from '@project-serum/token';

describe('Subscription', () => {
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftClub as Program<NftClub>;

  describe('creation and updation of subscription', () => {
    it('Subscribe to a creator', async () => {
      const creatorsWalletKeypair = anchor.web3.Keypair.generate();
      let signature = await program.provider.connection.requestAirdrop(
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

      const usersWalletKeypair = anchor.web3.Keypair.generate();
      signature = await program.provider.connection.requestAirdrop(
        usersWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const userPubKey = usersWalletKeypair.publicKey;

      const subscriptionSeeds = [
        creatorPubKey.toBuffer(),
        userPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];

      const [subscriptionPubKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds,
          program.programId
        );

      const txn = new anchor.web3.Transaction();
      const signers = [creatorsWalletKeypair, usersWalletKeypair];

      txn.add(
        program.instruction.createAccount(
          'blahblah',
          'blah@email.com',
          'blah',
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
          'Name',
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

      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey,
            creator: creatorPubKey,
            creatorSolAccount: creatorsWalletKeypair.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      await program.provider.send(txn, signers);

      const creatorAccount = await program.account.creator.fetch(creatorPubKey);
      const benefitAccount = await program.account.benefit.fetch(benefitPubKey);
      const subscriptionAccount = await program.account.subscription.fetch(
        subscriptionPubKey
      );

      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorsWalletKeypair.publicKey.toBase58()
      );
      assert.equal(
        benefitAccount.authority.toBase58(),
        creatorAccount.authority.toBase58()
      );
      assert.equal(benefitAccount.description, 'benefit test description');
      assert.equal(subscriptionAccount.user.toBase58(), userPubKey.toBase58());
      assert.equal(
        subscriptionAccount.creator.toBase58(),
        creatorPubKey.toBase58()
      );
    });

    it('Subscribe to multiple creators and fetch the subscriptions of that user', async () => {
      const creatorsWalletKeypair1 = anchor.web3.Keypair.generate();
      let signature = await program.provider.connection.requestAirdrop(
        creatorsWalletKeypair1.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const creatorSeeds1 = [
        creatorsWalletKeypair1.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey1] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds1,
        program.programId
      );

      let benefitNumber = anchor.utils.bytes.utf8.encode('1');
      let benefitSeeds = [
        creatorPubKey1.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber,
      ];

      const [benefitPubKey1] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const creatorsWalletKeypair2 = anchor.web3.Keypair.generate();
      signature = await program.provider.connection.requestAirdrop(
        creatorsWalletKeypair2.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const creatorSeeds2 = [
        creatorsWalletKeypair2.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('creator'),
      ];

      const [creatorPubKey2] = await anchor.web3.PublicKey.findProgramAddress(
        creatorSeeds2,
        program.programId
      );

      benefitNumber = anchor.utils.bytes.utf8.encode('1');
      benefitSeeds = [
        creatorPubKey2.toBuffer(),
        anchor.utils.bytes.utf8.encode('benefit'),
        benefitNumber,
      ];

      const [benefitPubKey2] = await anchor.web3.PublicKey.findProgramAddress(
        benefitSeeds,
        program.programId
      );

      const usersWalletKeypair = anchor.web3.Keypair.generate();
      signature = await program.provider.connection.requestAirdrop(
        usersWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);

      const userPubKey = usersWalletKeypair.publicKey;

      const subscriptionSeeds1 = [
        creatorPubKey1.toBuffer(),
        userPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];

      const [subscriptionPubKey1] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds1,
          program.programId
        );

      const subscriptionSeeds2 = [
        creatorPubKey2.toBuffer(),
        userPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];

      const [subscriptionPubKey2] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds2,
          program.programId
        );

      const txn = new anchor.web3.Transaction();
      const signers = [
        creatorsWalletKeypair1,
        creatorsWalletKeypair2,
        usersWalletKeypair,
      ];

      txn.add(
        program.instruction.createAccount(
          'blahblah',
          'blah@email.com',
          'blah',
          {
            accounts: {
              creator: creatorPubKey1,
              authority: creatorsWalletKeypair1.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair1],
          }
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'Name',
          'benefit test description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey1,
              creator: creatorPubKey1,
              authority: creatorsWalletKeypair1.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair1],
          }
        )
      );

      txn.add(
        program.instruction.createAccount(
          'blahblah',
          'blah@email.com',
          'blah',
          {
            accounts: {
              creator: creatorPubKey2,
              authority: creatorsWalletKeypair2.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair2],
          }
        )
      );

      txn.add(
        program.instruction.createBenefit(
          'Name',
          'benefit test description',
          benefitNumber,
          {
            accounts: {
              benefit: benefitPubKey2,
              creator: creatorPubKey2,
              authority: creatorsWalletKeypair2.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [creatorsWalletKeypair2],
          }
        )
      );

      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey1,
            creator: creatorPubKey1,
            creatorSolAccount: creatorsWalletKeypair1.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey2,
            creator: creatorPubKey2,
            creatorSolAccount: creatorsWalletKeypair2.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      await program.provider.send(txn, signers);

      const subs = await program.account.subscription.all([
        {
          memcmp: {
            offset: 8,
            bytes: userPubKey.toBase58(),
          },
        },
      ]);
      assert.equal(subs.length, 2);
      assert.equal(
        subs[0].publicKey.toBase58() == subscriptionPubKey1.toBase58() ||
          subs[0].publicKey.toBase58() == subscriptionPubKey2.toBase58(),
        true
      );
      assert.equal(
        subs[1].publicKey.toBase58() == subscriptionPubKey1.toBase58() ||
          subs[1].publicKey.toBase58() == subscriptionPubKey2.toBase58(),
        true
      );
      assert.equal(subs[0].account.user.toBase58(), userPubKey.toBase58());
      assert.equal(subs[1].account.user.toBase58(), userPubKey.toBase58());
      assert.equal(
        subs[0].account.creator.toBase58() == creatorPubKey1.toBase58() ||
          subs[0].account.creator.toBase58() == creatorPubKey2.toBase58(),
        true
      );
      assert.equal(
        subs[1].account.creator.toBase58() == creatorPubKey1.toBase58() ||
          subs[1].account.creator.toBase58() == creatorPubKey2.toBase58(),
        true
      );
    });
  });

  describe('Creation and updation: constraints', () => {
    it('Update a subscription: should fail if tried to update a non-expired subscription', async () => {
      const creatorsWalletKeypair = anchor.web3.Keypair.generate();
      let signature = await program.provider.connection.requestAirdrop(
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
      const usersWalletKeypair = anchor.web3.Keypair.generate();
      signature = await program.provider.connection.requestAirdrop(
        usersWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);
      const userPubKey = usersWalletKeypair.publicKey;
      const subscriptionSeeds = [
        creatorPubKey.toBuffer(),
        userPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];
      const [subscriptionPubKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds,
          program.programId
        );
      const txn = new anchor.web3.Transaction();
      const signers = [creatorsWalletKeypair, usersWalletKeypair];
      txn.add(
        program.instruction.createAccount(
          'blahblah',
          'blah@email.com',
          'blah',
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
          'Name',
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
      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey,
            creator: creatorPubKey,
            creatorSolAccount: creatorsWalletKeypair.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      txn.add(
        program.instruction.updateSubscription({
          accounts: {
            subscription: subscriptionPubKey,
            creator: creatorPubKey,
            creatorSolAccount: creatorsWalletKeypair.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      try {
        await program.provider.send(txn, signers);
      } catch (error) {
        // assert.equal(error.msg, 'The subscription has not expired.');
        return;
      }
      assert.fail(
        'The instruction should have failed with updating non-expired subscription'
      );
    });

    it('Re-subsribing should fail', async () => {
      const creatorsWalletKeypair = anchor.web3.Keypair.generate();
      let signature = await program.provider.connection.requestAirdrop(
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
      const usersWalletKeypair = anchor.web3.Keypair.generate();
      signature = await program.provider.connection.requestAirdrop(
        usersWalletKeypair.publicKey,
        1000000000 // 1 SOL — or 1 billion lamports
      );
      await program.provider.connection.confirmTransaction(signature);
      const userPubKey = usersWalletKeypair.publicKey;
      const subscriptionSeeds = [
        creatorPubKey.toBuffer(),
        userPubKey.toBuffer(),
        anchor.utils.bytes.utf8.encode('subscription'),
      ];
      const [subscriptionPubKey] =
        await anchor.web3.PublicKey.findProgramAddress(
          subscriptionSeeds,
          program.programId
        );
      const txn = new anchor.web3.Transaction();
      const signers = [creatorsWalletKeypair, usersWalletKeypair];
      txn.add(
        program.instruction.createAccount(
          'blahblah',
          'blah@email.com',
          'blah',
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
          'Name',
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
      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey,
            creator: creatorPubKey,
            creatorSolAccount: creatorsWalletKeypair.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );
      txn.add(
        program.instruction.createSubscription({
          accounts: {
            subscription: subscriptionPubKey,
            creator: creatorPubKey,
            creatorSolAccount: creatorsWalletKeypair.publicKey,
            user: userPubKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [usersWalletKeypair],
        })
      );

      try {
        await program.provider.send(txn, signers);
      } catch (error) {
        return;
      }
      assert.fail(
        'The instruction should have failed with re-subscribing to the same creator'
      );
    });
  });
});
