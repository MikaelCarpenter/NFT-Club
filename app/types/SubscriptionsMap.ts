import { Benefit } from './Benefit';
import { Creator } from './Creator';
import { Subscription } from './Subscription';

export type SubscriptionsMap = Record<
  string,
  {
    account: Subscription;
    creator: Creator;
    benefits: Benefit[];
  }
>;
