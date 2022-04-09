import React, { Dispatch, SetStateAction } from 'react';
import { Creator } from '../types/Creator';
import { SubscriptionsMap } from '../types/SubscriptionsMap';

type UserContextType = {
  creatorAccount: Creator | null;
  subscriptions: SubscriptionsMap;
  isLoading: boolean;
};

const defaultUser: UserContextType = {
  creatorAccount: null,
  subscriptions: {},
  isLoading: true,
};

const defaultSetUser: Dispatch<SetStateAction<UserContextType>> = () => {};

const UserContext = React.createContext({
  user: defaultUser,
  setUser: defaultSetUser,
});

const { Provider, Consumer } = UserContext;

export {
  UserContext,
  Provider as UserProvider,
  Consumer as UserConsumer,
  defaultUser,
};
