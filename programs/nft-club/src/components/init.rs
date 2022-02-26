use anchor_lang::prelude::*;

// 
// Endpoints
// 

pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
  Ok(())
}

// 
// Data Validators
// 

#[derive(Accounts)]
pub struct Initialize {}

// 
// Data Structures
// 

// 
// Events
// 