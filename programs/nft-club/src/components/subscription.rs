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

    let clock: Clock = Clock::get().unwrap();
    
    // In lamports; equivalent to 0.1 SOL
    let amount_to_pay_in_lamports: u64 = 100000000;

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
        amount_to_pay_in_lamports
    )?;

    subscription.user = *user.key;
    subscription.creator = creator.key();
    subscription.expire_timestamp = clock.unix_timestamp + 30 * 24 * 60 * 60; // Set it to expire after 30 days
    subscription.bump = *ctx.bumps.get("subscription").unwrap();

    Ok(())
}

pub fn update_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
    let subscription: &mut Account<Subscription> = &mut ctx.accounts.subscription;
    let user: &Signer = &ctx.accounts.user;
    let creator: &Account<Creator> = &ctx.accounts.creator;

    let clock: Clock = Clock::get().unwrap();
    
    // In lamports; equivalent to 0.1 SOL
    let amount_to_pay_in_lamports: u64 = 100000000;

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
        amount_to_pay_in_lamports
    )?;

    // Set it to expire after 30 days
    subscription.expire_timestamp = clock.unix_timestamp + 30 * 24 * 60 * 60;

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
    #[account(
        init, 
        // seeded with creatorPubKey + userPubKey + "subscription"
        seeds = [creator.key().as_ref(), user.key().as_ref(), b"subscription".as_ref()], 
        bump, 
        payer = user, 
        space = Subscription::LEN
    )]
    pub subscription: Account<'info, Subscription>,

    // Define user as mutable - money in their account
    #[account(mut)]
    pub user: Signer<'info>,

    // Creator
    #[account(mut)]
    pub creator: Account<'info, Creator>,

    // Ensure System Program is the official one from Solana
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
}

// Update an existing subcription
#[derive(Accounts)]
pub struct UpdateSubscription<'info> {
    // Get the subscription for the following combination:
    // creatorPubKey + userPubKey + "subscription"
    #[account(seeds = [creator.key().as_ref(), user.key().as_ref(), b"subscription".as_ref()], bump)]
    pub subscription: Account<'info, Subscription>,

    // Define user as mutable - money in their account
    #[account(mut)]
    pub user: Signer<'info>,

    // Creator
    #[account(mut)]
    pub creator: Account<'info, Creator>,

    // Ensure the subscription is not expired before updating
    #[account(
        constraint = Clock::get().unwrap().unix_timestamp > subscription.expire_timestamp 
        @ errors::ErrorCode::SubscriptionNotExpired
    )]
    // Ensure System Program is the official one from Solana
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Subscription {
    pub user: Pubkey,
    pub creator: Pubkey,
    pub expire_timestamp: i64,
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
