import { useState, type ChangeEvent } from 'react';
import JSZip from 'jszip';
import { Card, FileInput, Label, Badge } from 'flowbite-react';

interface FileData {
  name: string;
  size: number;
  zip: JSZip;
}

function FileLoader() {
  const [fileData, setFileData] = useState<FileData | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const fileNames = Object.keys(zip.files);
      
      console.log(`File name: ${file.name}`);
      console.log(`File size: ${file.size} bytes`);
      console.log(`ZIP entries: ${fileNames.length}`);
      fileNames.forEach((filePath) => {
        console.log(filePath);
      });

      setFileData({
        name: file.name,
        size: file.size,
        zip: zip,
      });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Load eBook
      </h5>
      <div className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-4">
          <Label htmlFor="file-upload" className="text-gray-500 dark:text-gray-400">
            Select an EPUB file to load
          </Label>
          <FileInput
            id="file-upload"
            accept=".epub"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {fileData && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="success" size="sm">
              Loaded
            </Badge>
            <span className="font-medium text-gray-900 dark:text-white">
              {fileData.name}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-gray-500 dark:text-gray-400">Size:</Label>
              <span className="text-gray-900 dark:text-white">
                {(fileData.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex justify-between">
              <Label className="text-gray-500 dark:text-gray-400">Entries:</Label>
              <span className="text-gray-900 dark:text-white">
                {Object.keys(fileData.zip.files).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default FileLoader;
