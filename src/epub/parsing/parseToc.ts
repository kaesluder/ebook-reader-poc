import type { NavItem } from '../types';

const EPUB_NS = 'http://www.idpf.org/2007/ops';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

function parseOl(ol: Element): NavItem[] {
  return Array.from(ol.children)
    .filter(el => el.localName === 'li')
    .map(li => {
      const a = Array.from(li.children).find(el => el.localName === 'a');
      const label = a?.textContent?.trim() ?? '';
      const href = a?.getAttribute('href') ?? '';
      const nestedOl = Array.from(li.children).find(el => el.localName === 'ol');
      const children = nestedOl ? parseOl(nestedOl) : [];
      return { label, href, children };
    });
}

export function parseToc(html: string): NavItem[] {
  const doc = new DOMParser().parseFromString(html, 'application/xhtml+xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid TOC XHTML: ${parserError.textContent}`);
  }

  const navEls = Array.from(doc.getElementsByTagNameNS(XHTML_NS, 'nav'));
  const tocNav = navEls.find(el => el.getAttributeNS(EPUB_NS, 'type') === 'toc');

  if (!tocNav) throw new Error('No nav[epub:type="toc"] found');

  const ol = Array.from(tocNav.children).find(el => el.localName === 'ol');
  if (!ol) return [];

  return parseOl(ol);
}
