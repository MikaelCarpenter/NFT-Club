use anchor_lang::prelude::*;
use crate::*;
use anchor_spl::token::{Token, Transfer};

// 
// Endpoints
// 
pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
    let subscription: &mut Account<Subscription> = &mut ctx.accounts.subscription;
    let user: &Signer = &ctx.accounts.user;
    let creator: &Account<Creator> = &ctx.accounts.creator;
    let benefit: &Account<Benefit> = &ctx.accounts.benefit;

    let clock: Clock = Clock::get().unwrap();
    
    let amount_to_pay: u64 = benefit.cost_per_month;

    // Transfer the amount from user to the creator
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: user.to_account_info(),
                to: creator.to_account_info(),
                authority: user.to_account_info()
            }
        ),
        amount_to_pay
    )?;

    subscription.user = *user.key;
    subscription.benefit = benefit.key();
    subscription.timestamp = clock.unix_timestamp;
    subscription.bump = *ctx.bumps.get("subscription").unwrap();

    Ok(())
}

// 
// Data Validators
//

// Create a new subcription
#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    // Create account of type Subscription and assign creator's pubkey as the payer
    // This also makes sure that we have only one subscription for the following combination:
    // benefitPubKey + userPubKey + "subscription"
    #[account(init, seeds = [benefit.key().as_ref(), user.key().as_ref(), b"subscription".as_ref()], bump, payer = user, space = Subscription::LEN)]
    pub subscription: Account<'info, Subscription>,

    // Define user as mutable - money in their account
    #[account(mut)]
    pub user: Signer<'info>,

    // Creator of the benefit
    #[account(mut)]
    pub creator: Account<'info, Creator>,

    // The benefit to which user wants to subscribe to
    pub benefit: Account<'info, Benefit>,

    // Ensure System Program is the official one from Solana
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Subscription {
    pub user: Pubkey,
    pub benefit: Pubkey,
    pub timestamp: i64,
    pub bump: u8
}

// Constants for sizing properties
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBKEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const BUMP_LENGTH: usize = 1;

impl Subscription {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBKEY_LENGTH
        + PUBKEY_LENGTH
        + TIMESTAMP_LENGTH
        + BUMP_LENGTH;
}
