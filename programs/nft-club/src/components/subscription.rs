use anchor_lang::prelude::*;
use crate::*;

// 
// Endpoints
// 
pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
    let subscription: &mut Account<Subscription> = &mut ctx.accounts.subscription;
    let user: &Signer = &ctx.accounts.user;
    let benefit: &Account<Benefit> = &ctx.accounts.benefit;
    let clock: Clock = Clock::get().unwrap();

    // Todo: Here we need to add logic to check the following
    // 1. If the user doesn't have a subscription, then return.
    // 2. If the user has the subscription, and it hasn't expired return,
    // 3. If the user has the subscription, and it has expired, then update.

    subscription.user = *user.key;
    subscription.benefit = benefit.key();
    subscription.timestamp = clock.unix_timestamp;
    subscription.bump = *ctx.bumps.get("subscription").unwrap();

    Ok(())
}

// 
// Data Validators
// 
#[derive(Accounts)]
pub struct CreateSubscription<'info> {
    // Create account of type Subscription and assign creator's pubkey as the payer
    #[account(init, seeds = [benefit.key().as_ref(), user.key().as_ref(), b"subscription".as_ref()], bump, payer = user, space = Subscription::LEN)]
    pub subscription: Account<'info, Subscription>,

    // Define user as mutable - money in their account
    #[account(mut)]
    pub user: Signer<'info>,

    // The benefit to which user wants to subscribe to
    pub benefit: Account<'info, Benefit>,

    // Ensure System Program is the official one from Solana
    pub system_program: Program<'info, System>,
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
