import { describe, it, expect } from 'vitest';
import { epubReducer, initialState } from './epubReducer';
import type { EpubBook } from '../types';

const stubBook: EpubBook = {
  metadata: {
    title: 'Test Book',
    authors: ['Author'],
    language: 'en',
    identifier: 'test-id',
  },
  manifest: [],
  spine: [],
  toc: [],
};

describe('epubReducer', () => {
  it('starts in idle state', () => {
    expect(initialState).toEqual({ status: 'idle', book: null, error: null });
  });

  it('LOAD_START → loading, clears book and error', () => {
    const prev = { status: 'error' as const, book: null, error: 'oops' };
    expect(epubReducer(prev, { type: 'LOAD_START' })).toEqual({
      status: 'loading',
      book: null,
      error: null,
    });
  });

  it('LOAD_SUCCESS → loaded with book', () => {
    const prev = { status: 'loading' as const, book: null, error: null };
    const next = epubReducer(prev, { type: 'LOAD_SUCCESS', book: stubBook });
    expect(next.status).toBe('loaded');
    expect(next.book).toBe(stubBook);
    expect(next.error).toBeNull();
  });

  it('LOAD_ERROR → error with message, clears book', () => {
    const prev = { status: 'loading' as const, book: null, error: null };
    const next = epubReducer(prev, { type: 'LOAD_ERROR', error: 'bad zip' });
    expect(next.status).toBe('error');
    expect(next.book).toBeNull();
    expect(next.error).toBe('bad zip');
  });

  it('unknown action returns state unchanged', () => {
    // @ts-expect-error testing unknown action
    const next = epubReducer(initialState, { type: 'UNKNOWN' });
    expect(next).toBe(initialState);
  });
});
