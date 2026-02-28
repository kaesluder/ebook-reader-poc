import type { NavItem } from '../types';

const NCX_NS = 'http://www.daisy.org/z3986/2005/ncx/';

function parseNavPoint(navPoint: Element): NavItem {
  const navLabelEl = Array.from(navPoint.children).find(el => el.localName === 'navLabel');
  const textEl = navLabelEl
    ? Array.from(navLabelEl.children).find(el => el.localName === 'text')
    : undefined;
  const label = textEl?.textContent?.trim() ?? '';

  const contentEl = Array.from(navPoint.children).find(el => el.localName === 'content');
  const href = contentEl?.getAttribute('src') ?? '';

  const children = Array.from(navPoint.children)
    .filter(el => el.localName === 'navPoint')
    .map(parseNavPoint);

  return { label, href, children };
}

export function parseNcx(xml: string): NavItem[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid NCX: ${parserError.textContent}`);
  }

  const navMap = doc.getElementsByTagNameNS(NCX_NS, 'navMap')[0];
  if (!navMap) throw new Error('No navMap found in NCX');

  return Array.from(navMap.children)
    .filter(el => el.localName === 'navPoint')
    .map(parseNavPoint);
}
