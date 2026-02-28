import JSZip from 'jszip';
import type { EpubBook, NavItem } from '../types';
import { parseContainer } from './parseContainer';
import { parseOpf } from './parseOpf';
import { parseToc } from './parseToc';
import { parseNcx } from './parseNcx';

async function readZipFile(zip: JSZip, path: string): Promise<string> {
  const entry = zip.file(path);
  if (!entry) throw new Error(`Missing file in EPUB: ${path}`);
  return entry.async('string');
}

export async function loadEpub(zip: JSZip): Promise<{ book: EpubBook; opfDir: string }> {
  const containerXml = await readZipFile(zip, 'META-INF/container.xml');
  const opfPath = parseContainer(containerXml);

  const slashIdx = opfPath.lastIndexOf('/');
  const opfDir = slashIdx >= 0 ? opfPath.slice(0, slashIdx + 1) : '';

  const opfXml = await readZipFile(zip, opfPath);
  const { metadata, manifest, spine } = parseOpf(opfXml);

  const navItem = manifest.find(m => m.properties?.split(/\s+/).includes('nav'));

  let toc: NavItem[];
  if (navItem) {
    const tocHtml = await readZipFile(zip, opfDir + navItem.href);
    toc = parseToc(tocHtml);
  } else {
    const ncxItem = manifest.find(m => m.mediaType === 'application/x-dtbncx+xml');
    if (ncxItem) {
      const ncxXml = await readZipFile(zip, opfDir + ncxItem.href);
      toc = parseNcx(ncxXml);
    } else {
      toc = [];
    }
  }

  return { book: { metadata, manifest, spine, toc }, opfDir };
}
