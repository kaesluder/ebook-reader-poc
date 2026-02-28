import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { EpubProvider } from '../epub/store/EpubContext';

vi.mock('jszip', () => ({
  default: {
    loadAsync: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../epub/parsing/loadEpub', () => ({
  loadEpub: vi.fn().mockResolvedValue({
    book: {
      metadata: {
        title: 'Mock Book Title',
        authors: ['Mock Author'],
        language: 'en',
        identifier: 'mock-id',
      },
      manifest: [],
      spine: [],
      toc: [{ label: 'Chapter 1', href: 'ch1.xhtml', children: [] }],
    },
    opfDir: 'epub/',
  }),
}));

import FileLoader from './FileLoader';
import { loadEpub } from '../epub/parsing/loadEpub';

const wrapper = ({ children }: { children: ReactNode }) => (
  <EpubProvider>{children}</EpubProvider>
);

const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });

describe('FileLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the file input', () => {
    render(<FileLoader />, { wrapper });
    expect(screen.getByLabelText(/select an epub file to load/i)).toBeInTheDocument();
  });

  it('shows book title and metadata after successful load', async () => {
    render(<FileLoader />, { wrapper });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => expect(loadEpub).toHaveBeenCalled());
    expect(await screen.findByText('Mock Book Title')).toBeInTheDocument();
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
    expect(screen.getByText('Mock Author')).toBeInTheDocument();
  });

  it('shows error message on load failure', async () => {
    vi.mocked(loadEpub).mockRejectedValueOnce(new Error('bad zip file'));
    render(<FileLoader />, { wrapper });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByText('bad zip file')).toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
