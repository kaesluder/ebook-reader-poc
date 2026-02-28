import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { loadEpub } from './loadEpub';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testBooksDir = resolve(__dirname, '../../../test-books');

function makeMockZip(fileMap: Record<string, string>): JSZip {
  return {
    file: (path: string) => {
      const content = fileMap[path];
      if (content === undefined) return null;
      return { async: (_type: string) => Promise.resolve(content) };
    },
  } as unknown as JSZip;
}

const fileMap: Record<string, string> = {
  'META-INF/container.xml': readFileSync(resolve(testBooksDir, 'META-INF/container.xml'), 'utf-8'),
  'epub/content.opf':       readFileSync(resolve(testBooksDir, 'epub/content.opf'), 'utf-8'),
  'epub/toc.xhtml':         readFileSync(resolve(testBooksDir, 'epub/toc.xhtml'), 'utf-8'),
  'epub/toc.ncx':           readFileSync(resolve(testBooksDir, 'epub/toc.ncx'), 'utf-8'),
};

describe('loadEpub', () => {
  describe('happy path (EPUB 3 nav)', () => {
    let book: Awaited<ReturnType<typeof loadEpub>>;

    beforeAll(async () => {
      book = await loadEpub(makeMockZip(fileMap));
    });

    it('returns correct metadata', () => {
      expect(book.metadata.title).toBe('Sir Gawain and the Green Knight');
      expect(book.metadata.authors).toContain('Anonymous');
      expect(book.metadata.language).toBe('en-GB');
    });

    it('returns full manifest', () => {
      expect(book.manifest).toHaveLength(24);
    });

    it('returns full spine', () => {
      expect(book.spine).toHaveLength(14);
      expect(book.spine[0].idref).toBe('titlepage.xhtml');
    });

    it('returns toc from EPUB 3 nav', () => {
      expect(book.toc).toHaveLength(10);
      expect(book.toc[0].label).toBe('Titlepage');
      expect(book.toc[0].href).toBe('text/titlepage.xhtml');
    });

    it('toc has nested children', () => {
      const gawain = book.toc.find(item => item.label === 'Sir Gawain and the Green Knight');
      expect(gawain?.children).toHaveLength(4);
      expect(gawain?.children[0].label).toBe('Fit I');
    });
  });

  describe('NCX fallback', () => {
    it('uses NCX when no nav item in manifest', async () => {
      const opfWithoutNav = fileMap['epub/content.opf'].replace(' properties="nav"', '');
      const book = await loadEpub(makeMockZip({ ...fileMap, 'epub/content.opf': opfWithoutNav }));
      expect(book.toc).toHaveLength(10);
      expect(book.toc[4].label).toBe('Sir Gawain and the Green Knight');
      expect(book.toc[4].children).toHaveLength(4);
    });
  });

  describe('empty toc fallback', () => {
    it('returns empty toc when neither nav nor NCX is in manifest', async () => {
      const opfStripped = fileMap['epub/content.opf']
        .replace(' properties="nav"', '')
        .replace(' media-type="application/x-dtbncx+xml"', ' media-type="application/octet-stream"');
      const book = await loadEpub(makeMockZip({ ...fileMap, 'epub/content.opf': opfStripped }));
      expect(book.toc).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('throws when container.xml is missing', async () => {
      const { 'META-INF/container.xml': _omit, ...rest } = fileMap;
      await expect(loadEpub(makeMockZip(rest))).rejects.toThrow('Missing file in EPUB: META-INF/container.xml');
    });

    it('throws when OPF file is missing', async () => {
      const { 'epub/content.opf': _omit, ...rest } = fileMap;
      await expect(loadEpub(makeMockZip(rest))).rejects.toThrow('Missing file in EPUB: epub/content.opf');
    });
  });
});
