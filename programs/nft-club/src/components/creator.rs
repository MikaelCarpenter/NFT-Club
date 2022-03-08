use anchor_lang::prelude::*;

// 
// Endpoints
// 
pub fn create_account(ctx: Context<CreateAccount>, username: String, email: String, description: String, num_benefits: u8) -> Result<()> {
    let creator: &mut Account<Creator> = &mut ctx.accounts.creator;
    let authority: &Signer = &ctx.accounts.authority;
    msg!("username: {}", username);
    msg!("email: {}", email);
    msg!("description: {}", description);

    if username.chars().count() > 42 {
        msg!("USERNAME");
        return err!(ErrorCode::UsernameTooLong);
    }

    if email.chars().count() > 42 {
        msg!("EMAIL");
        return err!(ErrorCode::EmailTooLong);
    }

    if description.chars().count() > 420 {
        msg!("DESCRIPTION_");
        return err!(ErrorCode::DescriptionTooLong);
    }

    creator.authority = *authority.key;
    creator.username = username;
    creator.email = email;
    creator.description = description;
    creator.num_benefits = num_benefits;

    Ok(())
}

// 
// Data Validators
// 
#[derive(Accounts)]
pub struct CreateAccount<'info> {
    // Create account of type Creator and assign creators's pubkey as the payer
    // has_one guarantees that account is both signed by authority
    // and that &creator.authority == authority.key
    #[account(init, payer = authority, has_one = authority, space = Creator::LEN)]
    pub creator: Account<'info, Creator>,

    // Define user as mutable - money in their account, profile data, etc.
    #[account(mut)]
    pub authority: Signer<'info>,

    // Ensure System Program is the official one from Solana.
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
}

// Constants for sizing properties
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const USERNAME_LENGTH: usize = 42 * 4;
const EMAIL_LENGTH: usize = 42 * 4;
const DESCRIPTION_LENGTH: usize = 420 * 4;
const NUM_BENEFITS_LENGTH: usize = 1;


impl Creator {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH
        + STRING_LENGTH_PREFIX + USERNAME_LENGTH
        + STRING_LENGTH_PREFIX + EMAIL_LENGTH
        + STRING_LENGTH_PREFIX + DESCRIPTION_LENGTH
        + NUM_BENEFITS_LENGTH;
}

// 
// Events
// 
#[error_code]
pub enum ErrorCode {
    #[msg("The provided Creator username should be 42 characters long maximum.")]
    UsernameTooLong,
    #[msg("The provided Creator email should be 42 characters long maximum.")]
    EmailTooLong,
    #[msg("The provided Creator description should be 420 characters long maximum.")]
    DescriptionTooLong,
    #[msg("The provided Benefit description should be 420 characters long maximum.")]
    BenefitDescriptionTooLong,
}
