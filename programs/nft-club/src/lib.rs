use anchor_lang::prelude::*;

pub mod errors;
pub mod components;
// pub mod utils;

use components::*;

declare_id!("6dND1tHXuvCzB9Fe88FvnrZEqTVraPWGxtR5HQs4Z3dx");

#[program]
pub mod nft_club {
    use super::*;

    pub fn create_account(
        ctx: Context<CreateAccount>, 
        username: String, 
        email: String, 
        description: String,
        num_benefits: u8
    ) -> Result<()> {
        components::create_account(ctx, username, email, description, num_benefits)
        //catch error
    }

    pub fn create_benefit(ctx: Context<CreateBenefit>, name: String, description: String) -> Result<()> {
        components::create_benefit(ctx, name, description)
    }

    pub fn create_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
        components::create_subscription(ctx)
    }

    pub fn update_subscription(ctx: Context<CreateSubscription>) -> Result<()> {
        components::update_subscription(ctx)
    }
}
