/**
 * Parses an EPUB container.xml and returns the path to the OPF package file.
 */
export function parseContainer(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid container.xml: ${parserError.textContent}`);
  }

  const rootfile = doc.getElementsByTagName('rootfile')[0];
  if (!rootfile) {
    throw new Error('No rootfile found in container.xml');
  }

  const fullPath = rootfile.getAttribute('full-path');
  if (!fullPath) {
    throw new Error('rootfile element missing full-path attribute');
  }

  return fullPath;
}
