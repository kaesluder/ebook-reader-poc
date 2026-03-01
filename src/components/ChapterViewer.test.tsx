import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import JSZip from 'jszip';
import ChapterViewer, { resolvePath } from './ChapterViewer';
import { EpubProvider, useEpub } from '../epub/store/EpubContext';
import type { EpubBook } from '../epub/types';

// --- resolvePath unit tests ---

describe('resolvePath', () => {
  it('resolves a simple relative path', () => {
    expect(resolvePath('epub/text/', '../css/core.css')).toBe('epub/css/core.css');
  });

  it('handles path with no parent traversal', () => {
    expect(resolvePath('epub/', 'text/chapter1.xhtml')).toBe('epub/text/chapter1.xhtml');
  });

  it('handles multiple parent traversals', () => {
    expect(resolvePath('a/b/c/', '../../d/e.css')).toBe('a/d/e.css');
  });

  it('handles root-level base dir', () => {
    expect(resolvePath('', 'text/chapter1.xhtml')).toBe('text/chapter1.xhtml');
  });
});

// --- ChapterViewer component tests ---

function makeMockZip(files: Record<string, string>): JSZip {
  return {
    file: (path: string) => {
      const content = files[path];
      if (content === undefined) return null;
      return { async: () => Promise.resolve(content) };
    },
  } as unknown as JSZip;
}

const chapterHtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Test Chapter</title>
    <link href="../css/test.css" rel="stylesheet" type="text/css"/>
  </head>
  <body>
    <p>Hello chapter world</p>
  </body>
</html>`;

const mockZip = makeMockZip({
  'epub/text/chapter1.xhtml': chapterHtml,
  'epub/css/test.css': 'body { color: red; }',
});

const stubBook: EpubBook = {
  metadata: { title: 'Test', authors: ['Author'], language: 'en', identifier: 'id' },
  manifest: [],
  spine: [],
  toc: [{ label: 'Chapter 1', href: 'text/chapter1.xhtml', children: [] }],
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <EpubProvider>{children}</EpubProvider>
);

function TestHarness() {
  const { dispatch } = useEpub();
  return (
    <>
      <button
        onClick={() => {
          dispatch({ type: 'LOAD_SUCCESS', book: stubBook, zip: mockZip, opfDir: 'epub/' });
          dispatch({ type: 'SELECT_CHAPTER', href: 'text/chapter1.xhtml' });
        }}
      >
        load and select
      </button>
      <ChapterViewer />
    </>
  );
}

describe('ChapterViewer', () => {
  it('renders a placeholder div when no chapter is selected', () => {
    const { container } = render(<ChapterViewer />, { wrapper });
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders an iframe once a chapter is selected', async () => {
    render(<EpubProvider><TestHarness /></EpubProvider>);
    await userEvent.click(screen.getByText('load and select'));

    const iframe = await waitFor(() => screen.getByTitle('Chapter content'));
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('srcdoc includes chapter body content', async () => {
    render(<EpubProvider><TestHarness /></EpubProvider>);
    await userEvent.click(screen.getByText('load and select'));

    const iframe = await waitFor(
      () => screen.getByTitle('Chapter content') as HTMLIFrameElement
    );
    expect(iframe.getAttribute('srcdoc')).toContain('Hello chapter world');
  });

  it('srcdoc includes CSS loaded from the zip', async () => {
    render(<EpubProvider><TestHarness /></EpubProvider>);
    await userEvent.click(screen.getByText('load and select'));

    const iframe = await waitFor(
      () => screen.getByTitle('Chapter content') as HTMLIFrameElement
    );
    expect(iframe.getAttribute('srcdoc')).toContain('body { color: red; }');
  });

  it('iframe has sandbox attribute', async () => {
    render(<EpubProvider><TestHarness /></EpubProvider>);
    await userEvent.click(screen.getByText('load and select'));

    const iframe = await waitFor(
      () => screen.getByTitle('Chapter content') as HTMLIFrameElement
    );
    expect(iframe.hasAttribute('sandbox')).toBe(true);
  });
});
