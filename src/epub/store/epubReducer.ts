import type { EpubBook, EpubState } from '../types';

export type EpubAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; book: EpubBook }
  | { type: 'LOAD_ERROR'; error: string };

export const initialState: EpubState = {
  status: 'idle',
  book: null,
  error: null,
};

export function epubReducer(state: EpubState, action: EpubAction): EpubState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', book: null, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'loaded', book: action.book, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', book: null, error: action.error };
    default:
      return state;
  }
}
