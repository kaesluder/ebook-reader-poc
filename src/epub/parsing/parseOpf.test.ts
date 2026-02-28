import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOpf } from './parseOpf';
import type { ManifestItem, SpineItem } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testBooksDir = resolve(__dirname, '../../../test-books');

describe('parseOpf', () => {
  let result: { metadata: ReturnType<typeof parseOpf>['metadata']; manifest: ManifestItem[]; spine: SpineItem[] };

  beforeAll(() => {
    const xml = readFileSync(resolve(testBooksDir, 'epub/content.opf'), 'utf-8');
    result = parseOpf(xml);
  });

  describe('metadata', () => {
    it('parses title', () => {
      expect(result.metadata.title).toBe('Sir Gawain and the Green Knight');
    });

    it('parses authors from dc:creator', () => {
      expect(result.metadata.authors).toContain('Anonymous');
    });

    it('parses language', () => {
      expect(result.metadata.language).toBe('en-GB');
    });

    it('parses identifier matching unique-identifier attribute', () => {
      expect(result.metadata.identifier).toBe(
        'https://standardebooks.org/ebooks/anonymous/sir-gawain-and-the-green-knight/s-o-andrew'
      );
    });

    it('parses publisher', () => {
      expect(result.metadata.publisher).toBe('Standard Ebooks');
    });

    it('parses description', () => {
      expect(result.metadata.description).toContain('supernatural challenge');
    });

    it('parses date', () => {
      expect(result.metadata.date).toBe('2026-02-23T01:31:48Z');
    });

    it('parses modifiedDate from meta[property="dcterms:modified"]', () => {
      expect(result.metadata.modifiedDate).toBe('2026-02-27T20:02:03Z');
    });

    it('parses subjects', () => {
      expect(result.metadata.subjects).toHaveLength(2);
      expect(result.metadata.subjects).toContain('Arthurian romances');
    });

    it('parses coverImageId from manifest item with properties="cover-image"', () => {
      expect(result.metadata.coverImageId).toBe('cover.jpg');
    });
  });

  describe('manifest', () => {
    it('has the correct number of items', () => {
      expect(result.manifest).toHaveLength(24);
    });

    it('maps id, href, and mediaType', () => {
      const ncx = result.manifest.find(m => m.id === 'ncx');
      expect(ncx).toBeDefined();
      expect(ncx?.href).toBe('toc.ncx');
      expect(ncx?.mediaType).toBe('application/x-dtbncx+xml');
    });

    it('includes the nav item with properties="nav"', () => {
      const nav = result.manifest.find(m => m.id === 'toc.xhtml');
      expect(nav).toBeDefined();
      expect(nav?.properties).toBe('nav');
    });

    it('includes the cover image item with properties="cover-image"', () => {
      const cover = result.manifest.find(m => m.id === 'cover.jpg');
      expect(cover).toBeDefined();
      expect(cover?.properties).toBe('cover-image');
    });

    it('leaves properties undefined when attribute is absent', () => {
      const plain = result.manifest.find(m => m.id === 'fit-1.xhtml');
      expect(plain).toBeDefined();
      expect(plain?.properties).toBeUndefined();
    });
  });

  describe('spine', () => {
    it('has 14 items', () => {
      expect(result.spine).toHaveLength(14);
    });

    it('first spine item is titlepage.xhtml', () => {
      expect(result.spine[0].idref).toBe('titlepage.xhtml');
    });

    it('last spine item is uncopyright.xhtml', () => {
      expect(result.spine[result.spine.length - 1].idref).toBe('uncopyright.xhtml');
    });

    it('all items default to linear=true', () => {
      expect(result.spine.every(s => s.linear === true)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws on malformed XML', () => {
      expect(() => parseOpf('<not valid xml')).toThrow();
    });

    it('throws if dc:title is missing', () => {
      const minimal = `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"></metadata><manifest/><spine/></package>`;
      expect(() => parseOpf(minimal)).toThrow('Missing dc:title');
    });
  });
});
