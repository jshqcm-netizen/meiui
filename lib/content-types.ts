/** Serializable content types. This module has no filesystem or server imports. */
export type ContentKind = 'blog' | 'docs';
export type ContentStatus = 'draft' | 'review' | 'published';

export interface ContentVideo {
  src: string;
  title: string;
  caption: string;
  hasSpeech: boolean;
  poster?: string;
  captions?: string;
}

export interface ContentMetadata {
  title: string;
  description: string;
  slug: string;
  kind: ContentKind;
  date: string;
  updated?: string;
  tags: string[];
  status: ContentStatus;
  sample: boolean;
  featured?: boolean;
  videos?: ContentVideo[];
}

export interface ContentHeading {
  id: string;
  text: string;
  level: number;
}

export interface ContentEntry extends ContentMetadata {
  readingMinutes: number;
  body: string;
  html: string;
  headings: ContentHeading[];
}

export interface ContentSearchEntry {
  title: string;
  description: string;
  slug: string;
  kind: ContentKind;
  tags: string[];
  href: string;
  text: string;
  sample: boolean;
}
