# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (HMR)
npm run build     # type-check + production build
npm run lint      # ESLint
npm test          # Vitest watch mode
npm test -- --run # Vitest single run (CI)
```

Run a single test file:
```bash
npm test -- --run src/epub/parsing/parseOpf.test.ts
```

## Architecture

### Data flow

```
FileLoader (picks .epub file)
  → JSZip.loadAsync (raw ZIP)
  → loadEpub(zip) → { book: EpubBook, opfDir: string }
  → dispatch LOAD_SUCCESS
  → EpubContext (React Context + useReducer)
  → Toolbar / ChapterList / ChapterViewer (consumers)
```

### EPUB parsing layer (`src/epub/`)

All parsers are **pure functions** that take XML/HTML strings and return typed data.

| File | Responsibility |
|------|----------------|
| `types.ts` | Shared types: `EpubBook`, `EpubState`, `NavItem`, `ManifestItem`, `SpineItem`, `EpubMetadata` |
| `parsing/loadEpub.ts` | Orchestrates parsing: reads `META-INF/container.xml` → OPF path → parses OPF, then EPUB 3 nav or EPUB 2 NCX for TOC |
| `parsing/parseContainer.ts` | Extracts OPF path from `container.xml` |
| `parsing/parseOpf.ts` | Parses `content.opf` → metadata, manifest, spine |
| `parsing/parseToc.ts` | Parses EPUB 3 `toc.xhtml` nav document → `NavItem[]` |
| `parsing/parseNcx.ts` | Parses EPUB 2 `toc.ncx` → `NavItem[]` (fallback) |

**Key detail:** `opfDir` (e.g. `"epub/"`) is stored in state and prepended when resolving href values from the manifest/spine, since all hrefs are relative to the OPF file's directory.

### State (`src/epub/store/`)

- `epubReducer.ts` — pure reducer with actions: `LOAD_START`, `LOAD_SUCCESS` (carries `book`, `zip`, `opfDir`), `LOAD_ERROR`, `SELECT_CHAPTER`
- `EpubContext.tsx` — wraps `useReducer`, exposes `{ state, dispatch }` via context; `EpubProvider` is the root wrapper in `App.tsx`

### UI layout

```
App
└── EpubProvider
    └── div.h-screen.flex.flex-col
        ├── Toolbar (sticky header)
        │   └── dropdown panel (absolute)
        │       ├── ChapterList  (auto-closes dropdown on chapter select via onAfterSelect)
        │       └── FileLoader
        └── main.flex-1.overflow-hidden
            └── ChapterViewer (iframe fills full height)
```

`ChapterViewer` renders chapter content in a sandboxed `<iframe srcdoc>`. It reads the chapter XHTML and any linked CSS from the JSZip object directly (no network requests), resolving paths via the `resolvePath` helper exported from `ChapterViewer.tsx`.

### Test fixtures

`test-books/` contains an unpacked EPUB 3.0 ("Sir Gawain and the Green Knight") used by `loadEpub.test.ts`. The OPF is at `test-books/epub/content.opf`.
