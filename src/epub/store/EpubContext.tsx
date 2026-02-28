import { createContext, useContext, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { epubReducer, initialState } from './epubReducer';
import type { EpubAction } from './epubReducer';
import type { EpubState } from '../types';

interface EpubContextValue {
  state: EpubState;
  dispatch: Dispatch<EpubAction>;
}

const EpubContext = createContext<EpubContextValue | null>(null);

export function EpubProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(epubReducer, initialState);
  return (
    <EpubContext.Provider value={{ state, dispatch }}>
      {children}
    </EpubContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEpub(): EpubContextValue {
  const ctx = useContext(EpubContext);
  if (!ctx) throw new Error('useEpub must be used inside EpubProvider');
  return ctx;
}
