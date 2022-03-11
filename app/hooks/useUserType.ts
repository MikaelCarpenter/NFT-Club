import {createContext, useContext} from 'react'

export enum Type {
    Creator = 'Creator',
    Normal = 'Normal',
};

export interface UserTypeState {
    type: Type,
    setUserType(type: Type): void
};

export const UserTypeContext = createContext<UserTypeState>({} as UserTypeState);

export const useUserType = (): UserTypeState => useContext(UserTypeContext)