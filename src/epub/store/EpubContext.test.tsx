import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import JSZip from 'jszip';
import { EpubProvider, useEpub } from './EpubContext';
import type { EpubBook } from '../types';

const stubBook: EpubBook = {
  metadata: { title: 'Test Book', authors: ['Author'], language: 'en', identifier: 'test-id' },
  manifest: [],
  spine: [],
  toc: [],
};

const stubZip = {} as JSZip;

const wrapper = ({ children }: { children: ReactNode }) => (
  <EpubProvider>{children}</EpubProvider>
);

describe('EpubContext', () => {
  it('provides idle initial state', () => {
    const { result } = renderHook(() => useEpub(), { wrapper });
    expect(result.current.state).toEqual({
      status: 'idle',
      book: null,
      error: null,
      selectedChapterHref: null,
      zip: null,
      opfDir: '',
    });
  });

  it('transitions to loading on LOAD_START', () => {
    const { result } = renderHook(() => useEpub(), { wrapper });
    act(() => result.current.dispatch({ type: 'LOAD_START' }));
    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to loaded on LOAD_SUCCESS', () => {
    const { result } = renderHook(() => useEpub(), { wrapper });
    act(() => result.current.dispatch({ type: 'LOAD_START' }));
    act(() => result.current.dispatch({ type: 'LOAD_SUCCESS', book: stubBook, zip: stubZip, opfDir: 'epub/' }));
    expect(result.current.state.status).toBe('loaded');
    expect(result.current.state.book).toBe(stubBook);
    expect(result.current.state.zip).toBe(stubZip);
    expect(result.current.state.opfDir).toBe('epub/');
  });

  it('transitions to error on LOAD_ERROR', () => {
    const { result } = renderHook(() => useEpub(), { wrapper });
    act(() => result.current.dispatch({ type: 'LOAD_START' }));
    act(() => result.current.dispatch({ type: 'LOAD_ERROR', error: 'bad zip' }));
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).toBe('bad zip');
  });

  it('useEpub throws when used outside EpubProvider', () => {
    expect(() => renderHook(() => useEpub())).toThrow('useEpub must be used inside EpubProvider');
  });
});
