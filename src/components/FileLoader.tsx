import { useState, type ChangeEvent } from 'react';
import JSZip from 'jszip';
import { Card, FileInput, Label, Badge, Spinner } from 'flowbite-react';
import { useEpub } from '../epub/store/EpubContext';
import { loadEpub } from '../epub/parsing/loadEpub';

function FileLoader() {
  const { state, dispatch } = useEpub();
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    dispatch({ type: 'LOAD_START' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const zip = await JSZip.loadAsync(arrayBuffer);
        const book = await loadEpub(zip);
        dispatch({ type: 'LOAD_SUCCESS', book });
      } catch (err) {
        dispatch({
          type: 'LOAD_ERROR',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Load eBook
      </h5>
      <div className="flex flex-col gap-4">
        <Label htmlFor="file-upload" className="text-gray-500 dark:text-gray-400">
          Select an EPUB file to load
        </Label>
        <FileInput
          id="file-upload"
          accept=".epub"
          onChange={handleFileChange}
          disabled={state.status === 'loading'}
        />
      </div>

      {state.status === 'loading' && (
        <div className="mt-4 flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Spinner size="sm" />
          <span>Loading {fileName}…</span>
        </div>
      )}

      {state.status === 'loaded' && state.book && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="success" size="sm">Loaded</Badge>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.book.metadata.title}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <Label className="text-gray-500 dark:text-gray-400">Author:</Label>
              <span className="text-gray-900 dark:text-white">
                {state.book.metadata.authors.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <Label className="text-gray-500 dark:text-gray-400">Language:</Label>
              <span className="text-gray-900 dark:text-white">
                {state.book.metadata.language}
              </span>
            </div>
            <div className="flex justify-between">
              <Label className="text-gray-500 dark:text-gray-400">Chapters:</Label>
              <span className="text-gray-900 dark:text-white">
                {state.book.toc.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge color="failure" size="sm">Error</Badge>
            <span className="text-red-700 dark:text-red-400 text-sm">
              {state.error}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default FileLoader;
