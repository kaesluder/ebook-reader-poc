import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import ChapterList from './ChapterList';
import { EpubProvider, useEpub } from '../epub/store/EpubContext';
import type { EpubBook } from '../epub/types';

const stubToc = [
  { label: 'Chapter One', href: 'chapter1.xhtml', children: [] },
  { label: 'Chapter Two', href: 'chapter2.xhtml', children: [] },
  { label: 'Chapter Three', href: 'chapter3.xhtml', children: [] },
];

const tocWithChildren = [
  {
    label: 'Part One',
    href: 'part1.xhtml',
    children: [
      { label: 'Fit I', href: 'fit-1.xhtml', children: [] },
      { label: 'Fit II', href: 'fit-2.xhtml', children: [] },
    ],
  },
  { label: 'Appendix', href: 'appendix.xhtml', children: [] },
];

const stubBook: EpubBook = {
  metadata: { title: 'Test Book', authors: ['Author'], language: 'en', identifier: 'test-id' },
  manifest: [],
  spine: [],
  toc: stubToc,
};

const bookWithEmptyToc: EpubBook = { ...stubBook, toc: [] };
const bookWithNestedToc: EpubBook = { ...stubBook, toc: tocWithChildren };

const wrapper = ({ children }: { children: ReactNode }) => (
  <EpubProvider>{children}</EpubProvider>
);

function TestHarness({ book }: { book: EpubBook }) {
  const { dispatch, state } = useEpub();
  return (
    <>
      <button onClick={() => dispatch({ type: 'LOAD_SUCCESS', book })}>load</button>
      <ChapterList />
      <span data-testid="selected">{state.selectedChapterHref ?? 'none'}</span>
    </>
  );
}

describe('ChapterList', () => {
  it('renders nothing when status is idle', () => {
    const { container } = render(<ChapterList />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when toc is empty', async () => {
    render(<EpubProvider><TestHarness book={bookWithEmptyToc} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    expect(screen.queryByText('Chapters')).toBeNull();
  });

  it('renders a button for each top-level TOC item when loaded', async () => {
    render(<EpubProvider><TestHarness book={stubBook} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('Chapters'));

    expect(screen.getByText('Chapter One')).toBeInTheDocument();
    expect(screen.getByText('Chapter Two')).toBeInTheDocument();
    expect(screen.getByText('Chapter Three')).toBeInTheDocument();
  });

  it('renders nested children under their parent item', async () => {
    render(<EpubProvider><TestHarness book={bookWithNestedToc} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('Chapters'));

    expect(screen.getByText('Part One')).toBeInTheDocument();
    expect(screen.getByText('Fit I')).toBeInTheDocument();
    expect(screen.getByText('Fit II')).toBeInTheDocument();
    expect(screen.getByText('Appendix')).toBeInTheDocument();
  });

  it('dispatches SELECT_CHAPTER with correct href on click', async () => {
    render(<EpubProvider><TestHarness book={stubBook} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('Chapters'));
    await userEvent.click(screen.getByText('Chapter Two'));

    expect(screen.getByTestId('selected').textContent).toBe('chapter2.xhtml');
  });

  it('dispatches SELECT_CHAPTER for a nested child item', async () => {
    render(<EpubProvider><TestHarness book={bookWithNestedToc} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('Chapters'));
    await userEvent.click(screen.getByText('Fit II'));

    expect(screen.getByTestId('selected').textContent).toBe('fit-2.xhtml');
  });

  it('applies highlight class to the selected chapter', async () => {
    render(<EpubProvider><TestHarness book={stubBook} /></EpubProvider>);
    await userEvent.click(screen.getByText('load'));
    await userEvent.click(screen.getByText('Chapters'));
    await userEvent.click(screen.getByText('Chapter One'));

    const chapterOneBtn = screen.getByText('Chapter One').closest('button')!;
    const chapterTwoBtn = screen.getByText('Chapter Two').closest('button')!;

    expect(chapterOneBtn.className).toContain('font-bold');
    expect(chapterTwoBtn.className).not.toContain('font-bold');
  });
});
