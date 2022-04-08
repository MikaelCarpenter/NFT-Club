import { IdlAccounts } from '@project-serum/anchor';
import { NftClub } from '../../target/types/nft_club';

export type Benefit = IdlAccounts<NftClub>['benefit'];
