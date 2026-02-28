import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { epubReducer, initialState } from './epubReducer';
import type { EpubBook, EpubState } from '../types';

const stubBook: EpubBook = {
  metadata: { title: 'Test Book', authors: ['Author'], language: 'en', identifier: 'test-id' },
  manifest: [],
  spine: [],
  toc: [],
};

const stubZip = {} as JSZip;

describe('epubReducer', () => {
  it('starts in idle state', () => {
    expect(initialState).toEqual({
      status: 'idle',
      book: null,
      error: null,
      selectedChapterHref: null,
      zip: null,
      opfDir: '',
    });
  });

  it('LOAD_START → loading, clears all transient state', () => {
    const prev: EpubState = {
      status: 'error',
      book: null,
      error: 'oops',
      selectedChapterHref: 'chapter1.xhtml',
      zip: stubZip,
      opfDir: 'epub/',
    };
    expect(epubReducer(prev, { type: 'LOAD_START' })).toEqual({
      status: 'loading',
      book: null,
      error: null,
      selectedChapterHref: null,
      zip: null,
      opfDir: '',
    });
  });

  it('LOAD_SUCCESS → loaded with book, zip, and opfDir', () => {
    const prev: EpubState = {
      status: 'loading',
      book: null,
      error: null,
      selectedChapterHref: null,
      zip: null,
      opfDir: '',
    };
    const next = epubReducer(prev, { type: 'LOAD_SUCCESS', book: stubBook, zip: stubZip, opfDir: 'epub/' });
    expect(next.status).toBe('loaded');
    expect(next.book).toBe(stubBook);
    expect(next.zip).toBe(stubZip);
    expect(next.opfDir).toBe('epub/');
    expect(next.error).toBeNull();
    expect(next.selectedChapterHref).toBeNull();
  });

  it('LOAD_ERROR → error with message, clears book and zip', () => {
    const prev: EpubState = {
      status: 'loading',
      book: null,
      error: null,
      selectedChapterHref: null,
      zip: null,
      opfDir: '',
    };
    const next = epubReducer(prev, { type: 'LOAD_ERROR', error: 'bad zip' });
    expect(next.status).toBe('error');
    expect(next.book).toBeNull();
    expect(next.zip).toBeNull();
    expect(next.error).toBe('bad zip');
    expect(next.selectedChapterHref).toBeNull();
  });

  it('SELECT_CHAPTER → sets selectedChapterHref, preserves zip', () => {
    const prev: EpubState = {
      status: 'loaded',
      book: stubBook,
      error: null,
      selectedChapterHref: null,
      zip: stubZip,
      opfDir: 'epub/',
    };
    const next = epubReducer(prev, { type: 'SELECT_CHAPTER', href: 'chapter2.xhtml' });
    expect(next.selectedChapterHref).toBe('chapter2.xhtml');
    expect(next.zip).toBe(stubZip);
    expect(next.status).toBe('loaded');
  });

  it('SELECT_CHAPTER → updates already-selected chapter', () => {
    const prev: EpubState = {
      status: 'loaded',
      book: stubBook,
      error: null,
      selectedChapterHref: 'chapter1.xhtml',
      zip: stubZip,
      opfDir: 'epub/',
    };
    const next = epubReducer(prev, { type: 'SELECT_CHAPTER', href: 'chapter3.xhtml' });
    expect(next.selectedChapterHref).toBe('chapter3.xhtml');
  });

  it('unknown action returns state unchanged', () => {
    // @ts-expect-error testing unknown action
    const next = epubReducer(initialState, { type: 'UNKNOWN' });
    expect(next).toBe(initialState);
  });
});
