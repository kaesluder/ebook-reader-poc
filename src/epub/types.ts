export interface EpubMetadata {
  title: string;
  authors: string[];       // dc:creator elements
  language: string;        // dc:language
  identifier: string;      // dc:identifier[@id matching package/@unique-identifier]
  publisher?: string;      // dc:publisher
  description?: string;    // dc:description
  date?: string;           // dc:date
  modifiedDate?: string;   // meta[@property="dcterms:modified"]
  subjects?: string[];     // dc:subject elements
  coverImageId?: string;   // manifest id where properties includes "cover-image"
}

export interface ManifestItem {
  id: string;
  href: string;            // relative to OPF file location
  mediaType: string;
  properties?: string;     // e.g. "nav", "cover-image"
}

export interface SpineItem {
  idref: string;           // references a ManifestItem.id
  linear: boolean;         // true unless linear="no"
}

export interface NavItem {
  label: string;
  href: string;            // relative to OPF file location
  children: NavItem[];
}

export interface EpubBook {
  metadata: EpubMetadata;
  manifest: ManifestItem[];
  spine: SpineItem[];
  toc: NavItem[];
}

export type EpubStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface EpubState {
  status: EpubStatus;
  book: EpubBook | null;
  error: string | null;
}
