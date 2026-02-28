import type JSZip from 'jszip';
import type { EpubBook, EpubState } from '../types';

export type EpubAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; book: EpubBook; zip: JSZip; opfDir: string }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SELECT_CHAPTER'; href: string };

export const initialState: EpubState = {
  status: 'idle',
  book: null,
  error: null,
  selectedChapterHref: null,
  zip: null,
  opfDir: '',
};

export function epubReducer(state: EpubState, action: EpubAction): EpubState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', book: null, error: null, selectedChapterHref: null, zip: null, opfDir: '' };
    case 'LOAD_SUCCESS':
      return { status: 'loaded', book: action.book, error: null, selectedChapterHref: null, zip: action.zip, opfDir: action.opfDir };
    case 'LOAD_ERROR':
      return { status: 'error', book: null, error: action.error, selectedChapterHref: null, zip: null, opfDir: '' };
    case 'SELECT_CHAPTER':
      return { ...state, selectedChapterHref: action.href };
    default:
      return state;
  }
}
