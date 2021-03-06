use anchor_lang::prelude::*;

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
    #[msg("The provided Benefit access_link should be 420 characters long maximum.")]
    BenefitAccessLinkTooLong,
    #[msg(
        "The provided Benefit benefit_number is not valid (It should be 1 + creator.num_benefits)."
    )]
    BenefitNumberInvalid,
    #[msg("The subscription has not expired.")]
    SubscriptionNotExpired,
}
