import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNcx } from './parseNcx';
import type { NavItem } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testBooksDir = resolve(__dirname, '../../../test-books');

describe('parseNcx', () => {
  let toc: NavItem[];

  beforeAll(() => {
    const xml = readFileSync(resolve(testBooksDir, 'epub/toc.ncx'), 'utf-8');
    toc = parseNcx(xml);
  });

  it('returns 10 top-level items', () => {
    expect(toc).toHaveLength(10);
  });

  it('first item is Titlepage', () => {
    expect(toc[0].label).toBe('Titlepage');
    expect(toc[0].href).toBe('text/titlepage.xhtml');
    expect(toc[0].children).toHaveLength(0);
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

  describe('error handling', () => {
    it('throws on malformed XML', () => {
      expect(() => parseNcx('<not valid xml')).toThrow();
    });

    it('throws when navMap is missing', () => {
      const noNavMap = `<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"></ncx>`;
      expect(() => parseNcx(noNavMap)).toThrow('No navMap found in NCX');
    });
  });
});
