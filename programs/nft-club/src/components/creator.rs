use crate::*;

//
// Endpoints
//
pub fn create_account(
    ctx: Context<CreateAccount>,
    username: String,
    email: String,
    description: String,
) -> Result<()> {
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;
    let authority: &Signer = &ctx.accounts.authority;
    msg!("username: {}", username);
    msg!("email: {}", email);
    msg!("description: {}", description);

    creator.authority = *authority.key;
    creator.username = username;
    creator.email = email;
    creator.description = description;
    creator.num_benefits = 0;
    creator.bump = *ctx.bumps.get("creator").unwrap();

    creator.bump = *ctx.bumps.get("creator").unwrap();

    Ok(())
}

// Bundle Benefit deletion into same transaction on frontend
// Add deletion of Benefits before deleting account here
pub fn delete_account(_ctx: Context<DeleteAccount>) -> Result<()> {
    msg!("Creator closed successfully");

    Ok(())
}

pub fn update_account(
    ctx: Context<UpdateAccount>,
    username: String,
    email: String,
    description: String,
) -> Result<()> {
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;
    msg!("username: {}", username);
    msg!("email: {}", email);
    msg!("description: {}", description);

    creator.username = username;
    creator.email = email;
    creator.description = description;

    Ok(())
}

// 
// Data Validators
//
#[derive(Accounts)]
#[instruction(username: String, email: String, description: String)]
pub struct CreateAccount<'info> {
    // Create account of type Creator and assign creators's pubkey as the payer
    // seeded with creatorWalletPubKey + "creator"
    #[account(init, seeds=[authority.key().as_ref(), b"creator"], bump, payer = authority, space = Creator::LEN)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, profile data, etc.
    #[account(mut)]
    pub authority: Signer<'info>,

    // Ensure System Program is the official one from Solana and handle errors
    #[account(constraint = username.chars().count() <= 42 @ errors::ErrorCode::UsernameTooLong)]
    #[account(constraint = email.chars().count() <= 42 @ errors::ErrorCode::EmailTooLong)]
    #[account(constraint = description.chars().count() <= 420 @ errors::ErrorCode::DescriptionTooLong)]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteAccount<'info> {
    // Create account of type Creator and assign creators's pubkey as the payer
    #[account(mut, seeds=[authority.key().as_ref(), b"creator"], bump=creator.bump, close=authority)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, profile data, etc.
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(username: String, email: String, description: String)]
pub struct UpdateAccount<'info> {
    // Create account of type Creator and assign creators's pubkey as the payer
    // seeded with creatorWalletPubKey + "creator"
    #[account(mut, has_one=authority, seeds=[authority.key().as_ref(), b"creator"], bump=creator.bump)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, profile data, etc.
    pub authority: Signer<'info>,

    // Ensure System Program is the official one from Solana and handle errors
    #[account(constraint = username.chars().count() <= 42 @ errors::ErrorCode::UsernameTooLong)]
    #[account(constraint = email.chars().count() <= 42 @ errors::ErrorCode::EmailTooLong)]
    #[account(constraint = description.chars().count() <= 420 @ errors::ErrorCode::DescriptionTooLong)]
    pub system_program: Program<'info, System>,
}

// 
// Data Structures
//
#[account]
pub struct Creator {
    pub authority: Pubkey,
    pub username: String,
    pub email: String,
    pub description: String,
    pub num_benefits: u8,
    pub bump: u8,
}

// Constants for sizing properties
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const USERNAME_LENGTH: usize = 42 * 4;
const EMAIL_LENGTH: usize = 42 * 4;
const DESCRIPTION_LENGTH: usize = 420 * 4;
const NUM_BENEFITS_LENGTH: usize = 1;
const BUMP_LENGTH: usize = 1;

impl Creator {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH
        + STRING_LENGTH_PREFIX
        + USERNAME_LENGTH
        + STRING_LENGTH_PREFIX
        + EMAIL_LENGTH
        + STRING_LENGTH_PREFIX
        + DESCRIPTION_LENGTH
        + NUM_BENEFITS_LENGTH
        + BUMP_LENGTH;
}
