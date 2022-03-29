import { FC, ReactNode, useEffect, useState } from 'react';
import { CreatorsContext } from '../hooks/useCreators';

export interface CreatorsProviderProps {
  children: ReactNode;
}

export const CreatorsProvider: FC<CreatorsProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [creators, setCreators] = useState<Record<string, unknown>[]>([]);

  return (
    <CreatorsContext.Provider
      value={{
        creators,
        isLoaded,
        setCreators,
        setIsLoaded,
      }}
    >
      {children}
    </CreatorsContext.Provider>
  );
};
