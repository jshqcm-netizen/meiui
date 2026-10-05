/** Build-time only. Never import this module into a Client Component. */
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parseDocument } from 'yaml';
import { z } from 'zod';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type {
  ContentEntry,
  ContentHeading,
  ContentKind,
  ContentMetadata,
  ContentSearchEntry,
} from './content-types';

export type { ContentEntry, ContentHeading, ContentKind, ContentMetadata, ContentSearchEntry, ContentStatus, ContentVideo } from './content-types';

export const CONTENT_LIMITS = Object.freeze({ sourceBytes: 128 * 1024, imageBytes: 5 * 1024 * 1024, imageCount: 12, videoBytes: 25 * 1024 * 1024, videoCount: 3, captionBytes: 128 * 1024, pdfBytes: 10 * 1024 * 1024, textBytes: 1024 * 1024 });
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isContentSlug = (slug: string): boolean => slug.length > 0 && slug.length <= 80 && SLUG_PATTERN.test(slug);
const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const videoSchema = z.object({
  src: z.string().min(1).max(200),
  title: z.string().trim().min(1).max(100),
  caption: z.string().trim().min(1).max(300),
  hasSpeech: z.boolean(),
  poster: z.string().min(1).max(200).optional(),
  captions: z.string().min(1).max(200).optional(),
}).strict().refine((video) => !video.hasSpeech || Boolean(video.captions), { message: 'Videos with speech require local WebVTT captions', path: ['captions'] });

export const contentMetadataSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(12).max(240),
  slug: z.string().refine(isContentSlug, 'Use lowercase letters, numbers and single hyphens (max 80 characters)'),
  kind: z.enum(['blog', 'docs']),
  date: z.string().refine(validDate, 'Use a real calendar date in YYYY-MM-DD format'),
  updated: z.string().refine(validDate, 'Use a real calendar date in YYYY-MM-DD format').optional(),
  tags: z.array(z.string().trim().min(1).max(30)).min(1).max(8).refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique'),
  status: z.enum(['draft', 'review', 'published']),
  sample: z.boolean(),
  featured: z.boolean().optional(),
  videos: z.array(videoSchema).max(CONTENT_LIMITS.videoCount).optional(),
}).strict().refine((data) => !data.updated || data.updated >= data.date, { message: 'updated cannot precede date', path: ['updated'] });

interface MarkdownNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  identifier?: string;
  depth?: number;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
}

export interface ContentPaths {
  contentDir?: string;
  publicDir?: string;
}
export interface ValidateContentOptions extends ContentPaths {
  expectedKind?: ContentKind;
  expectedSlug?: string;
  sourceName?: string;
}

export class ContentValidationError extends Error {
  constructor(message: string, sourceName = 'content') {
    super(`${sourceName}: ${message}`);
    this.name = 'ContentValidationError';
  }
}

/** Explicit YAML core schema; no executable gray-matter engine, custom tags or aliases. */
function parseSafeYaml(source: string): Record<string, unknown> {
  const document = parseDocument(source, { schema: 'core', version: '1.2', uniqueKeys: true, strict: true, customTags: [] });
  if (document.errors.length || document.warnings.length) {
    throw new Error([...document.errors, ...document.warnings].map((issue) => issue.message).join('; '));
  }
  const result: unknown = document.toJS({ maxAliasCount: 0 });
  if (!result || Array.isArray(result) || typeof result !== 'object') throw new Error('Frontmatter must be a YAML mapping');
  return result as Record<string, unknown>;
}

export function parseContentSource(source: string, options: ValidateContentOptions = {}): { metadata: ContentMetadata; body: string } {
  const name = options.sourceName;
  try {
    if (Buffer.byteLength(source, 'utf8') > CONTENT_LIMITS.sourceBytes) throw new Error('Markdown file exceeds 128 KiB');
    // gray-matter supports executable engines by default. Only a bare YAML delimiter is accepted.
    if (!/^---\r?\n/.test(source) || !/\r?\n---(?:\r?\n|$)/.test(source.slice(4))) {
      throw new Error('A plain --- YAML frontmatter block is required; MDX and alternate engines are disabled');
    }
    const parsed = matter(source, { language: 'yaml', engines: { yaml: parseSafeYaml } });
    const metadata = contentMetadataSchema.parse(parsed.data);
    if (options.expectedKind && metadata.kind !== options.expectedKind) throw new Error('kind must match its content directory');
    if (options.expectedSlug && metadata.slug !== options.expectedSlug) throw new Error('slug must match its Markdown filename');
    if (!parsed.content.trim()) throw new Error('Markdown body cannot be empty');
    return { metadata, body: parsed.content.trim() };
  } catch (error) {
    throw new ContentValidationError(error instanceof Error ? error.message : String(error), name);
  }
}

function walk(node: MarkdownNode, visit: (node: MarkdownNode) => void): void {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}
function nodeText(node: MarkdownNode): string {
  if (node.type === 'image' || node.type === 'imageReference') return node.alt ?? '';
  return node.value ?? (node.children ?? []).map(nodeText).join('');
}
function within(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
function decodedUrl(value: string): string {
  let result = value;
  for (let count = 0; count < 3; count++) {
    const next = decodeURIComponent(result);
    if (next === result) break;
    result = next;
  }
  return result;
}

/** Only https, fragment links and traversal-free root-relative links. */
export function validateContentLink(url: string): void {
  if (!url || /[\u0000-\u0020\u007f\\]/.test(url)) throw new Error(`Unsafe link URL: ${url}`);
  let decoded: string;
  try { decoded = decodedUrl(url); } catch { throw new Error(`Malformed link URL: ${url}`); }
  if (/[\u0000-\u0020\u007f\\]/.test(decoded)) throw new Error(`Unsafe encoded link URL: ${url}`);
  if (/^https:\/\//i.test(url)) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) throw new Error(`Unsafe external link: ${url}`);
    return;
  }
  if (url.startsWith('#') && url.length > 1) return;
  if (url.startsWith('/') && !url.startsWith('//') && !decoded.startsWith('//')) {
    const pathname = decoded.split(/[?#]/, 1)[0];
    if (!pathname.split('/').some((part) => part === '.' || part === '..')) return;
  }
  throw new Error(`Only https, #fragment and safe root-relative links are supported: ${url}`);
}

function imageSignatureMatches(extension: string, bytes: Buffer): boolean {
  if (extension === '.png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === '.gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'));
  if (extension === '.webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (extension === '.avif') return bytes.subarray(4, 8).toString('ascii') === 'ftyp' && /avif|avis/.test(bytes.subarray(8, 32).toString('ascii'));
  return false;
}

async function readLocalAsset(url: string, publicDir: string, extensions: string[], maxBytes: number, limitLabel: string): Promise<Buffer> {
  if (!/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_./-]{0,180}$/.test(url) || url.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('Media must use a local /media/ path without traversal, query strings or remote URLs');
  }
  if (!extensions.includes(path.extname(url).toLowerCase())) throw new Error(`Unsupported media extension; allowed: ${extensions.join(', ')}`);
  const publicRoot = await realpath(publicDir);
  const mediaRoot = await realpath(path.join(publicRoot, 'media'));
  if (mediaRoot === publicRoot || !within(publicRoot, mediaRoot)) throw new Error('Media directory must remain inside public/');
  const candidate = await realpath(path.join(publicRoot, url.slice(1)));
  if (!within(mediaRoot, candidate)) throw new Error('Media file resolves outside public/media/');
  const info = await stat(candidate);
  if (!info.isFile() || info.size === 0 || info.size > maxBytes) throw new Error(`Local media must be a nonempty file no larger than ${limitLabel}`);
  return readFile(candidate);
}

export async function validateLocalMedia(url: string, publicDir = path.join(process.cwd(), 'public')): Promise<void> {
  const bytes = await readLocalAsset(url, publicDir, ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'], CONTENT_LIMITS.imageBytes, '5 MiB');
  if (!imageSignatureMatches(path.extname(url).toLowerCase(), bytes)) throw new Error('Image contents do not match its file extension');
}

export async function validateLocalVideo(url: string, publicDir = path.join(process.cwd(), 'public')): Promise<void> {
  const bytes = await readLocalAsset(url, publicDir, ['.mp4', '.webm'], CONTENT_LIMITS.videoBytes, '25 MiB');
  const extension = path.extname(url).toLowerCase();
  const validMp4 = bytes.length >= 16 && bytes.subarray(4, 8).toString('ascii') === 'ftyp' && /isom|iso[2-9]|mp4[12]|avc1|M4V /.test(bytes.subarray(8, 40).toString('ascii'));
  const validWebm = bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) && bytes.subarray(4, 4096).includes(Buffer.from('webm'));
  if ((extension === '.mp4' && !validMp4) || (extension === '.webm' && !validWebm)) throw new Error('Video contents do not match its file extension');
}

function decodePlainText(bytes: Buffer): string {
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) throw new Error('Text media contains unsupported control characters');
  return text;
}

export async function validateLocalCaptions(url: string, publicDir = path.join(process.cwd(), 'public')): Promise<void> {
  const bytes = await readLocalAsset(url, publicDir, ['.vtt'], CONTENT_LIMITS.captionBytes, '128 KiB');
  const text = decodePlainText(bytes);
  if (!/^WEBVTT(?:[ \t][^\r\n]*)?\r?\n/.test(text) || !/\d{2}:\d{2}(?::\d{2})?\.\d{3} --> \d{2}:\d{2}(?::\d{2})?\.\d{3}/.test(text)) {
    throw new Error('Captions must be a UTF-8 WEBVTT file containing timed cues');
  }
  if (/<\/?(?:script|iframe|object|embed|style)\b|^STYLE(?:\r?\n|$)/im.test(text)) throw new Error('Executable markup and STYLE blocks are disabled in caption files');
}

/** Checks linked local downloads. This is a format boundary, not antivirus or PDF sanitization. */
export async function validateLocalAttachment(url: string, publicDir = path.join(process.cwd(), 'public')): Promise<void> {
  const extension = path.extname(url).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'].includes(extension)) return validateLocalMedia(url, publicDir);
  if (['.mp4', '.webm'].includes(extension)) return validateLocalVideo(url, publicDir);
  if (extension === '.vtt') return validateLocalCaptions(url, publicDir);
  if (extension === '.pdf') {
    const bytes = await readLocalAsset(url, publicDir, ['.pdf'], CONTENT_LIMITS.pdfBytes, '10 MiB');
    if (!bytes.subarray(0, 8).toString('ascii').match(/^%PDF-1\.[0-9]|^%PDF-2\.0/)) throw new Error('PDF contents do not match its file extension');
    return;
  }
  if (extension === '.txt') {
    decodePlainText(await readLocalAsset(url, publicDir, ['.txt'], CONTENT_LIMITS.textBytes, '1 MiB'));
    return;
  }
  throw new Error('Local attachment must be a supported image, video, WebVTT, PDF or TXT file');
}

function prepareHeadings(tree: MarkdownNode): ContentHeading[] {
  const headings: ContentHeading[] = [];
  const usedIds = new Set<string>();
  walk(tree, (node) => {
    if (node.type !== 'heading') return;
    const text = nodeText(node).trim();
    const base = text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '') || 'heading';
    let index = 1;
    let id = `section-${base}`;
    while (usedIds.has(id)) { index++; id = `section-${base}-${index}`; }
    usedIds.add(id);
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    headings.push({ id, text, level: node.depth ?? 2 });
  });
  return headings;
}

async function validateMarkdownTree(tree: MarkdownNode, publicDir?: string): Promise<void> {
  const definitions = new Map<string, MarkdownNode>();
  const images: { url: string; alt: string }[] = [];
  const attachments = new Set<string>();
  walk(tree, (node) => {
    if (node.type === 'definition' && node.identifier) {
      if (definitions.has(node.identifier)) throw new Error(`Duplicate link definition: ${node.identifier}`);
      definitions.set(node.identifier, node);
      validateContentLink(node.url ?? '');
      if (node.url?.startsWith('/media/')) attachments.add(node.url);
    }
  });
  walk(tree, (node) => {
    if (node.type === 'html' || node.type.startsWith('mdx')) throw new Error('Raw HTML, JSX and MDX are disabled; use ordinary Markdown');
    if (node.type === 'text' && /\{[^}]*\}/.test(node.value ?? '')) throw new Error('MDX-style expressions are disabled; show literal braces in inline code or a code block');
    if (node.type === 'text' && /^\s*(?:import|export)\s/m.test(node.value ?? '')) throw new Error('ESM/MDX imports and exports are disabled');
    if (node.type === 'link') {
      validateContentLink(node.url ?? '');
      if (node.url?.startsWith('/media/')) attachments.add(node.url);
    }
    if (node.type === 'linkReference') {
      const definition = definitions.get(node.identifier ?? '');
      if (definition) validateContentLink(definition.url ?? '');
    }
    if (node.type === 'image') images.push({ url: node.url ?? '', alt: node.alt ?? '' });
    if (node.type === 'imageReference') {
      const definition = definitions.get(node.identifier ?? '');
      if (!definition) throw new Error('Image reference is missing a definition');
      images.push({ url: definition.url ?? '', alt: node.alt ?? '' });
    }
  });
  if (images.length > CONTENT_LIMITS.imageCount) throw new Error('A page may contain at most 12 images');
  for (const image of images) {
    if (!image.alt.trim()) throw new Error('Every image needs meaningful alt text');
    await validateLocalMedia(image.url, publicDir);
  }
  for (const url of attachments) await validateLocalAttachment(url, publicDir);
}

export function estimateReadingMinutes(body: string): number {
  const chinese = (body.match(/[\p{Script=Han}]/gu) ?? []).length;
  const words = (body.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
  return Math.max(1, Math.ceil(chinese / 450 + words / 220));
}

export async function validateContentSource(source: string, options: ValidateContentOptions = {}): Promise<ContentEntry> {
  const { metadata, body } = parseContentSource(source, options);
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSanitize, {
        ...defaultSchema,
        clobberPrefix: '', // All authored heading IDs are generated with the fixed section- prefix.
        attributes: { ...defaultSchema.attributes, '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'] },
        protocols: { ...defaultSchema.protocols, href: ['https'], src: [] },
      })
      .use(rehypeStringify);
    const tree = processor.parse(body);
    await validateMarkdownTree(tree as unknown as MarkdownNode, options.publicDir);
    for (const video of metadata.videos ?? []) {
      await validateLocalVideo(video.src, options.publicDir);
      if (video.poster) await validateLocalMedia(video.poster, options.publicDir);
      if (video.captions) await validateLocalCaptions(video.captions, options.publicDir);
    }
    const headings = prepareHeadings(tree as unknown as MarkdownNode);
    const html = processor.stringify(await processor.run(tree));
    return { ...metadata, body, html, headings, readingMinutes: estimateReadingMinutes(body) };
  } catch (error) {
    throw new ContentValidationError(error instanceof Error ? error.message : String(error), options.sourceName);
  }
}

/** Internal/editor API. Includes drafts for validation; never serialize its result to the public client. */
export async function loadAllContent(options: ContentPaths = {}): Promise<ContentEntry[]> {
  const contentDir = options.contentDir ?? path.join(process.cwd(), 'content');
  const result: ContentEntry[] = [];
  const root = await realpath(contentDir);
  for (const kind of ['blog', 'docs'] as const) {
    const directory = path.join(root, kind);
    const resolvedDirectory = await realpath(directory);
    if (!within(root, resolvedDirectory)) throw new ContentValidationError('Content directory resolves outside content/', kind);
    const files = await readdir(directory, { withFileTypes: true });
    for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
      if (file.name.startsWith('.')) continue;
      if (!file.name.endsWith('.md') || !file.isFile()) throw new ContentValidationError('Only regular .md files are supported; no MDX, directories or symlinks', `${kind}/${file.name}`);
      const slug = file.name.slice(0, -3);
      if (!isContentSlug(slug)) throw new ContentValidationError('Invalid filename slug', `${kind}/${file.name}`);
      const filename = path.join(directory, file.name);
      if ((await stat(filename)).size > CONTENT_LIMITS.sourceBytes) throw new ContentValidationError('Markdown file exceeds 128 KiB', filename);
      const source = await readFile(filename, 'utf8');
      result.push(await validateContentSource(source, { ...options, expectedKind: kind, expectedSlug: slug, sourceName: `content/${kind}/${file.name}` }));
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Public API: draft and review documents cannot leave this boundary. */
export async function getAllContent(kind?: ContentKind): Promise<ContentEntry[]> {
  return (await loadAllContent()).filter((entry) => entry.status === 'published' && (!kind || entry.kind === kind));
}
export async function getContent(kind: ContentKind, slug: string): Promise<ContentEntry | undefined> {
  if (!['blog', 'docs'].includes(kind) || !isContentSlug(slug)) return undefined;
  return (await getAllContent(kind)).find((entry) => entry.slug === slug);
}
export async function getSearchIndex(): Promise<ContentSearchEntry[]> {
  return (await getAllContent()).map((entry) => ({
    title: entry.title,
    description: entry.description,
    slug: entry.slug,
    kind: entry.kind,
    tags: entry.tags,
    href: `/${entry.kind}/${entry.slug}/`,
    text: entry.body.replace(/```[\s\S]*?```/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_`>|~]/g, ' ').replace(/\s+/g, ' ').trim(),
    sample: entry.sample,
  }));
}
