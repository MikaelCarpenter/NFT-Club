use anchor_lang::prelude::*;

pub mod components;
// pub mod utils;

use components::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod nft_club {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        components::initialize(ctx)
    }
}
