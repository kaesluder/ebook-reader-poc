import { useState } from 'react';
import { useEpub } from '../epub/store/EpubContext';
import FileLoader from './FileLoader';
import ChapterList from './ChapterList';

export default function Toolbar() {
  const { state } = useEpub();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10 bg-white dark:bg-gray-800 shadow">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          eBook Reader
        </span>

        <span className="text-sm text-gray-600 dark:text-gray-300">
          {state.status === 'loaded' && state.book
            ? state.book.metadata.title
            : state.status === 'loading'
            ? 'Loading…'
            : state.status === 'error'
            ? 'Error loading book'
            : 'No book loaded'}
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
          aria-expanded={open}
        >
          {open ? 'Close ▲' : 'Menu ▼'}
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
          <ChapterList onAfterSelect={() => setOpen(false)} />
          <FileLoader />
        </div>
      )}
    </header>
  );
}
