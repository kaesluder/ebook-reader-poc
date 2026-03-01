import { useEffect, useState } from 'react';
import { useEpub } from '../epub/store/EpubContext';

/** Resolve a relative path against a base directory, collapsing `..` segments. */
export function resolvePath(baseDir: string, relativePath: string): string {
  const parts = (baseDir + relativePath).split('/');
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '..') resolved.pop();
    else if (part !== '.') resolved.push(part);
  }
  return resolved.join('/');
}

export default function ChapterViewer() {
  const { state } = useEpub();
  const [srcdoc, setSrcdoc] = useState<string | null>(null);

  useEffect(() => {
    if (!state.selectedChapterHref || !state.zip) {
      setSrcdoc(null);
      return;
    }

    const zip = state.zip;
    const chapterPath = state.opfDir + state.selectedChapterHref;
    let cancelled = false;

    async function loadChapter() {
      const chapterEntry = zip.file(chapterPath);
      if (!chapterEntry) return;
      const chapterHtml = await chapterEntry.async('string');

      const doc = new DOMParser().parseFromString(chapterHtml, 'application/xhtml+xml');
      if (doc.querySelector('parsererror')) return;

      const chapterDir = chapterPath.lastIndexOf('/') >= 0
        ? chapterPath.slice(0, chapterPath.lastIndexOf('/') + 1)
        : '';

      const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
      const cssContents = await Promise.all(
        links.map(async (link) => {
          const cssHref = link.getAttribute('href') ?? '';
          const cssEntry = zip.file(resolvePath(chapterDir, cssHref));
          if (!cssEntry) return '';
          return cssEntry.async('string');
        })
      );

      const body = doc.querySelector('body');
      const bodyHtml = body?.innerHTML ?? '';
      const styleBlock = cssContents
        .filter(Boolean)
        .map(css => `<style>${css}</style>`)
        .join('\n');

      if (!cancelled) {
        setSrcdoc(`<!DOCTYPE html><html><head>${styleBlock}</head><body>${bodyHtml}</body></html>`);
      }
    }

    loadChapter();
    return () => { cancelled = true; };
  }, [state.selectedChapterHref, state.zip, state.opfDir]);

  if (!srcdoc) return <div className="h-full" />;

  return (
    <iframe
      title="Chapter content"
      srcDoc={srcdoc}
      sandbox=""
      className="w-full h-full border-0 bg-stone-50"
    />
  );
}
