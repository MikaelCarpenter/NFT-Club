use anchor_lang::prelude::*;

pub mod components;
// pub mod utils;

use components::*;

declare_id!("6dND1tHXuvCzB9Fe88FvnrZEqTVraPWGxtR5HQs4Z3dx");

#[program]
pub mod nft_club {
    use super::*;
    pub fn create_account(ctx: Context<CreateAccount>, username: String, email: String, description: String, num_benefits: u8) -> Result<()> {
        components::create_account(ctx, username, email, description, num_benefits)
        //catch error
    }

    pub fn create_benefit(ctx: Context<CreateBenefit>, description: String) -> Result<()> {
        components::create_benefit(ctx, description)
    }
}
