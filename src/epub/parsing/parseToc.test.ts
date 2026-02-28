import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseToc } from './parseToc';
import type { NavItem } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testBooksDir = resolve(__dirname, '../../../test-books');

describe('parseToc', () => {
  let toc: NavItem[];

  beforeAll(() => {
    const html = readFileSync(resolve(testBooksDir, 'epub/toc.xhtml'), 'utf-8');
    toc = parseToc(html);
  });

  it('returns 10 top-level items', () => {
    expect(toc).toHaveLength(10);
  });

  it('first item is Titlepage', () => {
    expect(toc[0].label).toBe('Titlepage');
    expect(toc[0].href).toBe('text/titlepage.xhtml');
    expect(toc[0].children).toHaveLength(0);
  });

  it('includes Glossary', () => {
    const glossary = toc.find(item => item.label === 'Glossary');
    expect(glossary).toBeDefined();
    expect(glossary?.href).toBe('text/glossary.xhtml');
  });

  it('"Sir Gawain and the Green Knight" has 4 children', () => {
    const gawain = toc.find(item => item.label === 'Sir Gawain and the Green Knight');
    expect(gawain).toBeDefined();
    expect(gawain?.children).toHaveLength(4);
  });

  it('children of "Sir Gawain" are Fit I–IV with correct hrefs', () => {
    const gawain = toc.find(item => item.label === 'Sir Gawain and the Green Knight')!;
    expect(gawain.children[0]).toEqual({ label: 'Fit I', href: 'text/fit-1.xhtml', children: [] });
    expect(gawain.children[1]).toEqual({ label: 'Fit II', href: 'text/fit-2.xhtml', children: [] });
    expect(gawain.children[2]).toEqual({ label: 'Fit III', href: 'text/fit-3.xhtml', children: [] });
    expect(gawain.children[3]).toEqual({ label: 'Fit IV', href: 'text/fit-4.xhtml', children: [] });
  });

  it('last item is Uncopyright', () => {
    expect(toc[toc.length - 1].label).toBe('Uncopyright');
    expect(toc[toc.length - 1].href).toBe('text/uncopyright.xhtml');
  });

  it('ignores the landmarks nav', () => {
    const hasLandmarks = toc.some(item => item.label === 'Sir Gawain and the Green Knight' && item.href === 'text/fit-1.xhtml');
    expect(hasLandmarks).toBe(false);
  });

  describe('error handling', () => {
    it('throws on malformed XHTML', () => {
      expect(() => parseToc('<not valid xml')).toThrow();
    });

    it('throws when no toc nav is present', () => {
      const noToc = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><nav id="landmarks"></nav></body></html>`;
      expect(() => parseToc(noToc)).toThrow('No nav[epub:type="toc"] found');
    });
  });
});
