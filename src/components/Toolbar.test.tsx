import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JSZip from 'jszip';
import Toolbar from './Toolbar';
import { EpubProvider, useEpub } from '../epub/store/EpubContext';
import type { EpubBook } from '../epub/types';

const stubBook: EpubBook = {
  metadata: { title: 'Test Book', authors: [], language: 'en', identifier: 'id' },
  manifest: [],
  spine: [],
  toc: [
    { label: 'Chapter 1', href: 'ch1.xhtml', children: [] },
    { label: 'Chapter 2', href: 'ch2.xhtml', children: [] },
    { label: 'Chapter 3', href: 'ch3.xhtml', children: [] },
  ],
};

function LoadAndSelect({ href }: { href?: string }) {
  const { dispatch } = useEpub();
  return (
    <>
      <button onClick={() => dispatch({ type: 'LOAD_SUCCESS', book: stubBook, zip: {} as JSZip, opfDir: '' })}>
        load
      </button>
      {href && (
        <button onClick={() => dispatch({ type: 'SELECT_CHAPTER', href })}>
          select
        </button>
      )}
    </>
  );
}

function setup(initialHref?: string) {
  render(
    <EpubProvider>
      <LoadAndSelect href={initialHref} />
      <Toolbar />
    </EpubProvider>
  );
}

describe('Toolbar prev/next navigation', () => {
  it('prev and next buttons are disabled when no book is loaded', () => {
    render(<EpubProvider><Toolbar /></EpubProvider>);
    expect(screen.getByRole('button', { name: /previous chapter/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next chapter/i })).toBeDisabled();
  });

  it('both buttons disabled when no chapter is selected', async () => {
    setup();
    await userEvent.click(screen.getByText('load'));
    expect(screen.getByRole('button', { name: /previous chapter/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next chapter/i })).toBeDisabled();
  });

  it('prev disabled and next enabled on first chapter', async () => {
    setup('ch1.xhtml');
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('select'));
    expect(screen.getByRole('button', { name: /previous chapter/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next chapter/i })).not.toBeDisabled();
  });

  it('prev enabled and next disabled on last chapter', async () => {
    setup('ch3.xhtml');
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('select'));
    expect(screen.getByRole('button', { name: /previous chapter/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next chapter/i })).toBeDisabled();
  });

  it('next button advances to the next chapter', async () => {
    setup('ch1.xhtml');
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('select'));

    // After clicking Next, prev should become enabled (we moved off ch1)
    await userEvent.click(screen.getByRole('button', { name: /next chapter/i }));
    expect(screen.getByRole('button', { name: /previous chapter/i })).not.toBeDisabled();
  });

  it('prev button goes back to the previous chapter', async () => {
    setup('ch3.xhtml');
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('select'));

    // After clicking Prev from ch3, next should become enabled
    await userEvent.click(screen.getByRole('button', { name: /previous chapter/i }));
    expect(screen.getByRole('button', { name: /next chapter/i })).not.toBeDisabled();
  });

  it('navigates through all chapters with next button', async () => {
    setup('ch1.xhtml');
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('select'));

    const next = screen.getByRole('button', { name: /next chapter/i });
    await userEvent.click(next); // → ch2
    await userEvent.click(next); // → ch3
    expect(next).toBeDisabled();
  });
});
