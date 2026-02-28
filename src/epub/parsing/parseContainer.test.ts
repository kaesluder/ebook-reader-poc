import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContainer } from './parseContainer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testBooksDir = resolve(__dirname, '../../../test-books');

describe('parseContainer', () => {
  it('returns the OPF path from a valid container.xml', () => {
    const xml = readFileSync(resolve(testBooksDir, 'META-INF/container.xml'), 'utf-8');
    expect(parseContainer(xml)).toBe('epub/content.opf');
  });

  it('throws on a missing rootfile element', () => {
    const xml = `<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles></rootfiles></container>`;
    expect(() => parseContainer(xml)).toThrow('No rootfile found');
  });

  it('throws on malformed XML', () => {
    expect(() => parseContainer('<not valid xml')).toThrow();
  });
});
