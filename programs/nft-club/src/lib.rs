use anchor_lang::prelude::*;

pub mod components;
pub mod errors;
// pub mod utils;

use components::*;

declare_id!("CZeXHMniVHpEjkXTBzbpTJWR4qzgyZfRtjvviSxoUrWZ");

#[program]
pub mod nft_club {
    use super::*;

    pub fn create_account(
        ctx: Context<CreateAccount>,
        username: String,
        email: String,
        description: String,
    ) -> Result<()> {
        components::create_account(ctx, username, email, description)
        //catch error
    }

    pub fn create_benefit(
        ctx: Context<CreateBenefit>,
        name: String,
        description: String,
        benefit_number: String,
    ) -> Result<()> {
        components::create_benefit(ctx, name, description, benefit_number)
    }

    pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
        components::create_subscription(ctx)
    }

    pub fn update_subscription(ctx: Context<UpdateSubscription>) -> Result<()> {
        components::update_subscription(ctx)
    }

    pub fn delete_account(ctx: Context<DeleteAccount>) -> Result<()> {
        components::delete_account(ctx) 
    }

    pub fn delete_benefit(ctx: Context<DeleteBenefit>, benefit_number: String) -> Result<()> {
        components::delete_benefit(ctx, benefit_number)
    }

    pub fn update_account(ctx: Context<UpdateAccount>, username: String, email: String, description: String) -> Result<()> {
        components::update_account(ctx, username, email, description) 
    }

    pub fn update_benefit(ctx: Context<UpdateBenefit>, name: String, description: String, benefit_number: String) -> Result<()> {
        components::update_benefit(ctx, name, description, benefit_number)
    }
}
