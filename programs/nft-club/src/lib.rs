use anchor_lang::prelude::*;

pub mod components;
// pub mod utils;

use components::*;

declare_id!("GZsTnQNL9b2mYSdFhY6iNHKR1M5Ect4hTp5k8ZmyUyHX");

#[program]
pub mod nft_club {
    use super::*;
    pub fn create_account(ctx: Context<CreateAccount>, username: String, email: String, description: String, num_benefits: u8) -> ProgramResult {
        components::create_account(ctx, username, email, description, num_benefits);
        Ok(())
    }

    pub fn create_benefit(ctx: Context<CreateBenefit>, description: String) -> ProgramResult {
        components::create_benefit(ctx, description);
        Ok(())
    }
}
