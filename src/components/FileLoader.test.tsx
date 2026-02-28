import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock JSZip before importing the component
vi.mock('jszip', () => ({
  default: {
    loadAsync: vi.fn().mockResolvedValue({
      files: {
        'content.opf': {},
        'chapter1.xhtml': {},
        'chapter2.xhtml': {},
      },
    }),
  },
}));

import FileLoader from './FileLoader';
import JSZip from 'jszip';

describe('FileLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the file input', () => {
    render(<FileLoader />);
    const fileInput = screen.getByLabelText(/select an epub file to load/i);
    expect(fileInput).toBeInTheDocument();
  });

  it('file selection triggers file reading and state update', async () => {
    render(<FileLoader />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a mock file
    const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
    
    // Fire change event with the mock file
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Verify JSZip.loadAsync was called
    await waitFor(() => {
      expect(JSZip.loadAsync).toHaveBeenCalled();
    });
    
    // Verify the UI shows loaded file info (Badge shows "Loaded" text)
    const loadedBadge = await screen.findByText(/loaded/i);
    expect(loadedBadge).toBeInTheDocument();
    expect(screen.getByText(/test\.epub/i)).toBeInTheDocument();
  });
});
