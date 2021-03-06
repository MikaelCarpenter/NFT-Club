use anchor_lang::prelude::*;
use crate::*;

// 
// Endpoints
// 
pub fn create_benefit(
    ctx: Context<CreateBenefit>, 
    name: String, 
    description: String,
    access_link: String,
    _benefit_number: String
) -> Result<()> {
    let benefit: &mut Account<Benefit> = &mut ctx.accounts.benefit;
    let authority: &Signer = &ctx.accounts.authority;
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;

    // Try to increment. If overflow, panic will propagate an error
    creator.num_benefits = creator.num_benefits.checked_add(1).unwrap();

    benefit.authority = *authority.key;
    benefit.name = name;
    benefit.description = description;
    benefit.access_link = access_link;
    benefit.bump = *ctx.bumps.get("benefit").unwrap();

    Ok(())
}

// Replaces benefit to delete with the last benefit, then deletes the last benefit
pub fn delete_benefit(ctx: Context<DeleteBenefit>,  benefit_to_replace: String, last_benefit: String) -> Result<()> {
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;
    let old_benefit: &mut Account<Benefit> = &mut ctx.accounts.benefit_old;
    let benefit_last = &mut ctx.accounts.benefit_last;

    // Check if benefit_to_replace is last_benefit
    if !(benefit_to_replace == last_benefit) {
        old_benefit.name = benefit_last.name.clone();
        old_benefit.description = benefit_last.description.clone();
        old_benefit.access_link = benefit_last.access_link.clone();
    }

    // Try to decrement. If overflow, panic will propagate an error
    creator.num_benefits = creator.num_benefits.checked_sub(1).unwrap();

    msg!("Benefit closed successfully");

    Ok(())
}

pub fn update_benefit(
    ctx: Context<UpdateBenefit>, 
    name: String, 
    description: String,
    access_link: String,
    _benefit_number: String
) -> Result<()> {
    let benefit: &mut Account<Benefit> = &mut ctx.accounts.benefit;

    benefit.name = name;
    benefit.description = description;
    benefit.access_link = access_link;

    Ok(())
}

// 
// Data Validators
// 
#[derive(Accounts)]
#[instruction(name: String, description: String, access_link: String, benefit_number: String)]
pub struct CreateBenefit<'info> {
    // Create account of type Benefit and assign creator's pubkey as the payer
    // This also makes sure that we have only one benefit for the following combination
    #[account(
        init, 
        // seeded with creatorPubKey + benefit_number + "benefit".
        seeds = [creator.key().as_ref(), b"benefit", benefit_number.as_ref()], 
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
    #[account(constraint = access_link.chars().count() <= 420 @ errors::ErrorCode::BenefitAccessLinkTooLong)]
    // Ensure benefit_number == num_benefits + 1
    #[account(
        constraint = benefit_number.parse::<u8>().unwrap() == creator.num_benefits + 1 
        @ errors::ErrorCode::BenefitNumberInvalid
    )]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(benefit_to_replace: String, last_benefit: String)]
pub struct DeleteBenefit<'info> {
    // Create account of type Benefit and assign creator's pubkey as the payer
    #[account(mut, has_one = authority, seeds=[creator.key().as_ref(), b"benefit", benefit_to_replace.as_bytes()], bump=benefit_old.bump)]
    pub benefit_old: Account<'info, Benefit>,

    #[account(mut, has_one = authority, seeds=[creator.key().as_ref(), b"benefit", last_benefit.as_bytes()], bump=benefit_last.bump, close=authority)]
    pub benefit_last: Account<'info, Benefit>,

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
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, description: String, access_link: String, benefit_number: String)]
pub struct UpdateBenefit<'info> {
    // Update account of type Benefit and assign creator's pubkey as the payer
    #[account(
        mut, 
        // seeded with creatorPubKey + benefit_number + "benefit".
        seeds = [creator.key().as_ref(), b"benefit", benefit_number.as_ref()], 
        bump=benefit.bump, 
    )]
    pub benefit: Account<'info, Benefit>,

    // Guarantee that account is both signed by authority
    // and that &creator.authority == authority.key
    // In other words, signer must have a creator account to create a benefit
    #[account(mut, has_one = authority)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, description
    pub authority: Signer<'info>,

    // Ensure System Program is the official one from Solana and handle errors
    #[account(constraint = description.chars().count() <= 420 @ errors::ErrorCode::BenefitDescriptionTooLong)]
    #[account(constraint = access_link.chars().count() <= 420 @ errors::ErrorCode::BenefitAccessLinkTooLong)]
    pub system_program: Program<'info, System>,
}

//Add benefit number
#[account]
pub struct Benefit {
    pub authority: Pubkey,
    pub name: String,
    pub description: String,
    pub access_link: String,
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
const ACCESS_LINK_LENGTH: usize = 420 * 4;
const BUMP_LENGTH: usize = 1;

impl Benefit {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH 
        + STRING_LENGTH_PREFIX + NAME_LENGTH
        + STRING_LENGTH_PREFIX + DESCRIPTION_LENGTH
        + ACCESS_LINK_LENGTH + BUMP_LENGTH;
}
