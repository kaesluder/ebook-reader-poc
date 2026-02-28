import type { EpubMetadata, ManifestItem, SpineItem } from '../types';

const DC_NS = 'http://purl.org/dc/elements/1.1/';
const OPF_NS = 'http://www.idpf.org/2007/opf';

export function parseOpf(xml: string): {
  metadata: EpubMetadata;
  manifest: ManifestItem[];
  spine: SpineItem[];
} {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid OPF: ${parserError.textContent}`);
  }

  // unique-identifier attribute from package element
  const packageEl = doc.documentElement;
  const uniqueIdentifier = packageEl.getAttribute('unique-identifier') ?? '';

  // --- metadata ---

  const titleEl = doc.getElementsByTagNameNS(DC_NS, 'title')[0];
  if (!titleEl) throw new Error('Missing dc:title in OPF');
  const title = titleEl.textContent ?? '';

  const authorEls = Array.from(doc.getElementsByTagNameNS(DC_NS, 'creator'));
  const authors = authorEls.map(el => el.textContent ?? '').filter(Boolean);

  const languageEl = doc.getElementsByTagNameNS(DC_NS, 'language')[0];
  const language = languageEl?.textContent ?? '';

  const identifierEls = Array.from(doc.getElementsByTagNameNS(DC_NS, 'identifier'));
  const mainIdentifierEl =
    identifierEls.find(el => el.getAttribute('id') === uniqueIdentifier) ??
    identifierEls[0];
  const identifier = mainIdentifierEl?.textContent ?? '';

  const publisherEl = doc.getElementsByTagNameNS(DC_NS, 'publisher')[0];
  const publisher = publisherEl?.textContent ?? undefined;

  const descriptionEl = doc.getElementsByTagNameNS(DC_NS, 'description')[0];
  const description = descriptionEl?.textContent ?? undefined;

  const dateEl = doc.getElementsByTagNameNS(DC_NS, 'date')[0];
  const date = dateEl?.textContent ?? undefined;

  const metaEls = Array.from(doc.getElementsByTagNameNS(OPF_NS, 'meta'));
  const modifiedEl = metaEls.find(el => el.getAttribute('property') === 'dcterms:modified');
  const modifiedDate = modifiedEl?.textContent ?? undefined;

  const subjectEls = Array.from(doc.getElementsByTagNameNS(DC_NS, 'subject'));
  const subjects =
    subjectEls.length > 0
      ? subjectEls.map(el => el.textContent ?? '').filter(Boolean)
      : undefined;

  // --- manifest ---

  const manifestEl = doc.getElementsByTagNameNS(OPF_NS, 'manifest')[0];
  const itemEls = manifestEl
    ? Array.from(manifestEl.getElementsByTagNameNS(OPF_NS, 'item'))
    : [];

  const manifest: ManifestItem[] = itemEls.map(el => {
    const props = el.getAttribute('properties');
    return {
      id: el.getAttribute('id') ?? '',
      href: el.getAttribute('href') ?? '',
      mediaType: el.getAttribute('media-type') ?? '',
      ...(props !== null && { properties: props }),
    };
  });

  const coverItem = manifest.find(m => m.properties?.split(/\s+/).includes('cover-image'));
  const coverImageId = coverItem?.id;

  const metadata: EpubMetadata = {
    title,
    authors,
    language,
    identifier,
    ...(publisher !== undefined && { publisher }),
    ...(description !== undefined && { description }),
    ...(date !== undefined && { date }),
    ...(modifiedDate !== undefined && { modifiedDate }),
    ...(subjects !== undefined && { subjects }),
    ...(coverImageId !== undefined && { coverImageId }),
  };

  // --- spine ---

  const spineEl = doc.getElementsByTagNameNS(OPF_NS, 'spine')[0];
  const itemrefEls = spineEl
    ? Array.from(spineEl.getElementsByTagNameNS(OPF_NS, 'itemref'))
    : [];

  const spine: SpineItem[] = itemrefEls.map(el => ({
    idref: el.getAttribute('idref') ?? '',
    linear: el.getAttribute('linear') !== 'no',
  }));

  return { metadata, manifest, spine };
}
