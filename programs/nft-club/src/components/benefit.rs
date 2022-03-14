use anchor_lang::prelude::*;
use crate::*;

// 
// Endpoints
// 
pub fn create_benefit(ctx: Context<CreateBenefit>, name: String, description: String) -> Result<()> {
    let benefit: &mut Account<Benefit> = &mut ctx.accounts.benefit;
    let authority: &Signer = &ctx.accounts.authority;
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;

    // Try to increment. If overflow, panic will propagate an error
    creator.num_benefits = creator.num_benefits.checked_add(1).unwrap();

    benefit.authority = *authority.key;
    benefit.name = name;
    benefit.description = description;
    benefit.bump = *ctx.bumps.get("benefit").unwrap();

    Ok(())
}

// 
// Data Validators
// 
#[derive(Accounts)]
#[instruction(name: String, description: String)]
pub struct CreateBenefit<'info> {
    // Create account of type Benefit and assign creator's pubkey as the payer
    // This also makes sure that we have only one benefit for the following combination
    // creatorPubKey + name of benefit + "benefit".
    #[account(
        init, 
        seeds = [creator.key().as_ref(), name.as_ref(), b"benefit".as_ref()], 
        bump, 
        payer = authority, 
        space = Benefit::LEN
    )]
    pub benefit: Account<'info, Benefit>,

    // Guarantee that account is both signed by authority
    // and that &creator.authority == authority.key
    // In other words, signer must have a creator account to create a benefit
    // Use here and for updating Benefit/Creator accounts
    #[account(mut, has_one = authority)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, description
    #[account(mut)]
    pub authority: Signer<'info>,

    // Ensure System Program is the official one from Solana and handle errors
    #[account(constraint = description.chars().count() <= 420 @ errors::ErrorCode::BenefitDescriptionTooLong)]
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Benefit {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
    pub bump: u8,
}

/*
   Note on Benefits creation/access:
   On frontend, generate benefits using the pubkey of creator
   Filtering by pubkey to find benefit is not scalable
   pass seeds when creating benefits
   Use the seeds to reconstruct account address and fetch directly using fetch (instead of all)
   Seeds to create public address: creatorPublicKey, "benefit", "2"

   On Frontend: connection findProgramAddress() --> takes an array
   [pubkey, "benefits", index]
   Equates above array to address. Accesses it specfically without having to filter
   Loop through indices to access


   When deleting a Benefit, just close the account with anchor and decrement num_benefits
 */

// Constants for sizing properties
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const NAME_LENGTH: usize = 100 * 4;
const DESCRIPTION_LENGTH: usize = 420 * 4;
const BUMP_LENGTH: usize = 1;

impl Benefit {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH 
        + STRING_LENGTH_PREFIX + NAME_LENGTH
        + STRING_LENGTH_PREFIX + DESCRIPTION_LENGTH
        + BUMP_LENGTH;
}
