import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stringify } from 'yaml';
import {
  CONTENT_LIMITS,
  estimateReadingMinutes,
  getAllContent,
  getContent,
  getSearchIndex,
  isContentSlug,
  loadAllContent,
  parseContentSource,
  validateContentLink,
  validateContentSource,
  validateLocalMedia,
  validateLocalVideo,
  validateLocalCaptions,
  validateLocalAttachment,
} from '../lib/content';
import { runContentCli } from '../scripts/content';

const metadata = {
  title: '安全 Markdown 测试',
  description: '用于测试安全内容边界与状态隔离的技术示例。',
  slug: 'safe-note', kind: 'blog', date: '2026-10-05',
  tags: ['测试'], status: 'draft', sample: true,
};
function source(body = '## 开始\n\n这是一篇用于测试的内容。', changes: Record<string, unknown> = {}): string {
  return `---\n${stringify({ ...metadata, ...changes })}---\n\n${body}\n`;
}
async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'qcm-content-'));
  await Promise.all(['content/blog', 'content/docs', 'public/media'].map((directory) => mkdir(path.join(root, directory), { recursive: true })));
  return root;
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFncAAAAASUVORK5CYII=', 'base64');

test('schema requires explicit publication/sample metadata and rejects unknown fields', () => {
  assert.equal(parseContentSource(source()).metadata.status, 'draft');
  assert.throws(() => parseContentSource(source('', { status: 'public' })), /Invalid option/);
  assert.throws(() => parseContentSource(source('body', { sample: undefined })), /boolean/);
  assert.throws(() => parseContentSource(source('body', { readingMinutes: 2 })), /Unrecognized key/);
  assert.throws(() => parseContentSource(source('body', { date: '2026-02-30' })), /real calendar date/);
  assert.throws(() => parseContentSource(source('body', { updated: '2020-01-01' })), /precede/);
  assert.throws(() => parseContentSource(source('body'), { expectedKind: 'docs' }), /directory/);
  assert.throws(() => parseContentSource(source('body'), { expectedSlug: 'different' }), /filename/);
});

test('slugs reject traversal, separators, hidden files and escaped paths', () => {
  assert.equal(isContentSlug('build-a-site-2'), true);
  for (const slug of ['../secret', 'a/b', 'a\\b', '%2e%2e', '.env', 'a--b', 'UPPER', '-a', 'a-', 'a'.repeat(81)]) assert.equal(isContentSlug(slug), false, slug);
});

test('frontmatter disables executable gray-matter engines, custom tags, aliases and duplicate keys', () => {
  assert.throws(() => parseContentSource('---javascript\n({title:"oops"})\n---\nHello'), /plain --- YAML/);
  assert.throws(() => parseContentSource(source().replace('title: 安全 Markdown 测试', 'title: !unsafe something')), /Unresolved tag/);
  assert.throws(() => parseContentSource(source().replace('title: 安全 Markdown 测试', 'title: first\ntitle: second')), /unique/);
  assert.throws(() => parseContentSource(source().replace('title: 安全 Markdown 测试', 'title: &name example').replace('slug: safe-note', 'slug: *name')), /alias/i);
  assert.throws(() => parseContentSource(source('x'.repeat(CONTENT_LIMITS.sourceBytes))), /128 KiB/);
});

test('safe Markdown renders tables, code and deterministic non-clobbering heading IDs', async () => {
  const entry = await validateContentSource(source('## Hello 世界\n\n## Hello 世界\n\n| 名称 | 值 |\n| --- | --- |\n| 安全 | 是 |\n\n```html\n<script>alert(1)</script>\n```\n\n`export const value = { x: 1 }`'));
  assert.match(entry.html, /<table>/);
  assert.match(entry.html, /&#x3C;script>|&lt;script>/);
  assert.doesNotMatch(entry.html, /<script>/);
  assert.deepEqual(entry.headings.map((heading) => heading.id), ['section-hello-世界', 'section-hello-世界-2']);
  for (const heading of entry.headings) assert.ok(entry.html.includes(`id="${heading.id}"`));
  assert.ok(entry.readingMinutes >= 1);
  assert.equal(estimateReadingMinutes('中'.repeat(901)), 3);
});

test('headings remain unique when authored text resembles a generated duplicate suffix', async () => {
  const entry = await validateContentSource(source('## A\n\n## A\n\n## A-2\n\n## A'));
  assert.equal(new Set(entry.headings.map((heading) => heading.id)).size, 4);
  assert.deepEqual(entry.headings.map((heading) => heading.id), ['section-a', 'section-a-2', 'section-a-2-2', 'section-a-3']);
});

test('HTML, JSX, ESM, MDX expressions and unsafe link schemes are rejected', async () => {
  for (const body of ['<script>alert(1)</script>', '<img src="x" onerror="alert(1)">', '<Widget />', 'export const secret = 1', 'import x from "x"', '{process.env.SECRET}', '[run](javascript:alert%281%29)', '[run](data:text/html,hi)', '[plain](http://example.com)', '<test@example.com>']) {
    await assert.rejects(validateContentSource(source(body)), body);
  }
  for (const url of ['javascript:alert(1)', '//evil.test', '/%2e%2e/secrets', '/%252e%252e/secret', '/%2f%2fevil.test', '/foo\\bar', 'https://name:pass@example.com', 'data:image/png,x', '#x%0aonfocus=x']) assert.throws(() => validateContentLink(url), url);
  for (const url of ['https://example.com/docs?q=test#part', '/docs/getting-started/', '#section-开始']) assert.doesNotThrow(() => validateContentLink(url));
});

test('media checks actual files, size, extension, signature, alt text and containment', async () => {
  const root = await fixture();
  const publicDir = path.join(root, 'public');
  try {
    await writeFile(path.join(publicDir, 'media', 'pixel.png'), png);
    await validateLocalMedia('/media/pixel.png', publicDir);
    await validateContentSource(source('![有意义的图像说明](/media/pixel.png)'), { publicDir });
    await assert.rejects(validateContentSource(source('![](/media/pixel.png)'), { publicDir }), /alt text/);
    await assert.rejects(validateContentSource(source('![tracker](https://evil.test/pixel.png)'), { publicDir }), /local/);
    await assert.rejects(validateContentSource(source('![tracker][remote]\n\n[remote]: https://evil.test/pixel.png'), { publicDir }), /local/);
    await assert.rejects(validateContentSource(source(Array.from({ length: 13 }, () => '![pixel](/media/pixel.png)').join('\n')), { publicDir }), /at most 12/);
    for (const url of ['/media/../pixel.png', '/media/%2e%2e/pixel.png', '/media/missing.png', '/media/pixel.png?track=1', '/media/file.svg']) await assert.rejects(validateLocalMedia(url, publicDir), url);
    await writeFile(path.join(publicDir, 'media', 'fake.png'), '<script>alert(1)</script>');
    await assert.rejects(validateLocalMedia('/media/fake.png', publicDir), /extension/);
    await writeFile(path.join(publicDir, 'media', 'large.png'), Buffer.alloc(CONTENT_LIMITS.imageBytes + 1));
    await assert.rejects(validateLocalMedia('/media/large.png', publicDir), /5 MiB/);
    await writeFile(path.join(root, 'outside.png'), png);
    await symlink(path.join(root, 'outside.png'), path.join(publicDir, 'media', 'escape.png'));
    await assert.rejects(validateLocalMedia('/media/escape.png', publicDir), /outside/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('public routes and serialized search exclude drafts and review documents', async () => {
  const root = await fixture();
  const previousCwd = process.cwd();
  try {
    await writeFile(path.join(root, 'content/blog/draft-secret.md'), source('private-draft-marker', { slug: 'draft-secret' }));
    await writeFile(path.join(root, 'content/blog/review-secret.md'), source('private-review-marker', { slug: 'review-secret', status: 'review' }));
    await writeFile(path.join(root, 'content/blog/public-note.md'), source('public-example-marker', { slug: 'public-note', status: 'published' }));
    process.chdir(root);
    assert.equal((await loadAllContent()).length, 3);
    assert.deepEqual((await getAllContent()).map((entry) => entry.slug), ['public-note']);
    assert.equal(await getContent('blog', 'draft-secret'), undefined);
    assert.equal(await getContent('blog', 'review-secret'), undefined);
    assert.equal(await getContent('blog', '../private'), undefined);
    const serialized = JSON.stringify(await getSearchIndex());
    assert.match(serialized, /public-example-marker/);
    assert.doesNotMatch(serialized, /private-draft-marker|private-review-marker|draft-secret|review-secret/);
    assert.doesNotMatch(serialized, /"html"|"body"/);
  } finally { process.chdir(previousCwd); await rm(root, { recursive: true, force: true }); }
});

test('loader rejects MDX, malformed filenames and symlinked source files', async () => {
  const root = await fixture();
  const options = { contentDir: path.join(root, 'content'), publicDir: path.join(root, 'public') };
  try {
    const mdx = path.join(root, 'content/blog/unsafe.mdx');
    await writeFile(mdx, source());
    await assert.rejects(loadAllContent(options), /Only regular .md/);
    await rm(mdx);
    const invalid = path.join(root, 'content/blog/UPPER.md');
    await writeFile(invalid, source());
    await assert.rejects(loadAllContent(options), /filename slug/);
    await rm(invalid);
    await writeFile(path.join(root, 'outside.md'), source());
    await symlink(path.join(root, 'outside.md'), path.join(root, 'content/blog/safe-note.md'));
    await assert.rejects(loadAllContent(options), /symlinks/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('CLI enforces draft → review → explicit approval and isolated local previews', async () => {
  const root = await fixture();
  const previousCwd = process.cwd();
  try {
    process.chdir(root);
    await runContentCli(['new', '--kind', 'blog', '--slug', 'cli-note', '--title', 'CLI 草稿测试', '--sample']);
    const filename = path.join(root, 'content/blog/cli-note.md');
    assert.equal(parseContentSource(await readFile(filename, 'utf8')).metadata.status, 'draft');
    await assert.rejects(runContentCli(['new', '--kind', 'blog', '--slug', 'cli-note']), /EEXIST/);
    await assert.rejects(runContentCli(['new', '--kind', 'blog', '--slug', '../secret']), /slug/);
    await assert.rejects(runContentCli(['new', '--kind', 'blog', '--slug', 'other', '--publish']), /Unknown option/);
    await assert.rejects(runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'published']), /human approval/);
    await assert.rejects(runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'published', '--approve']), /draft → review/);
    await runContentCli(['preview', '--kind', 'blog', '--slug', 'cli-note']);
    assert.match(await readFile(path.join(root, '.content-preview/blog-cli-note.html'), 'utf8'), /noindex,nofollow/);
    assert.equal((await getAllContent()).length, 0);
    await runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'review']);
    await assert.rejects(runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'published']), /human approval/);
    await runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'published', '--approve']);
    assert.equal((await getAllContent()).length, 1);
    await runContentCli(['status', '--kind', 'blog', '--slug', 'cli-note', '--to', 'draft']);
    assert.equal((await getAllContent()).length, 0);
  } finally { process.chdir(previousCwd); await rm(root, { recursive: true, force: true }); }
});


test('video metadata is bounded and speech always requires captions', () => {
  const video = { src: '/media/demo.mp4', title: '演示', caption: '无语音概念演示。', hasSpeech: false };
  assert.equal(parseContentSource(source('正文', { videos: [video] })).metadata.videos?.length, 1);
  assert.throws(() => parseContentSource(source('正文', { videos: [{ ...video, hasSpeech: true }] })), /require local WebVTT/);
  assert.throws(() => parseContentSource(source('正文', { videos: [{ ...video, hasSpeech: undefined }] })), /boolean/);
  assert.throws(() => parseContentSource(source('正文', { videos: [{ ...video, caption: '' }] })), /Too small/);
  assert.throws(() => parseContentSource(source('正文', { videos: Array.from({ length: 4 }, () => ({ ...video })) })), /Too big/);
  assert.throws(() => parseContentSource(source('正文', { videos: [{ ...video, autoplay: true }] })), /Unrecognized key/);
});

test('local videos and WebVTT validate extensions, signatures, limits, subtitles and containment', async () => {
  const root = await fixture();
  const publicDir = path.join(root, 'public');
  const mediaDir = path.join(publicDir, 'media');
  const mp4 = Buffer.from('000000186674797069736f6d0000020069736f3261766331', 'hex');
  const vtt = 'WEBVTT\n\n00:00.000 --> 00:02.000\n这是一段示例字幕。\n';
  try {
    await writeFile(path.join(mediaDir, 'demo.mp4'), mp4);
    await writeFile(path.join(mediaDir, 'demo.webm'), Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.from('webm')]));
    await writeFile(path.join(mediaDir, 'demo.vtt'), vtt);
    await writeFile(path.join(mediaDir, 'poster.png'), png);
    await validateLocalVideo('/media/demo.mp4', publicDir);
    await validateLocalVideo('/media/demo.webm', publicDir);
    await validateLocalCaptions('/media/demo.vtt', publicDir);
    const video = { src: '/media/demo.mp4', title: '有字幕的演示', caption: '本地视频示例。', hasSpeech: true, captions: '/media/demo.vtt', poster: '/media/poster.png' };
    const entry = await validateContentSource(source('正文', { videos: [video] }), { publicDir });
    assert.equal(entry.videos?.[0].hasSpeech, true);
    await assert.rejects(validateContentSource(source('正文', { videos: [{ ...video, src: 'https://tracker.test/demo.mp4' }] }), { publicDir }), /local/);
    await assert.rejects(validateContentSource(source('正文', { videos: [{ ...video, poster: 'https://tracker.test/image.png' }] }), { publicDir }), /local/);
    await assert.rejects(validateContentSource(source('正文', { videos: [{ ...video, captions: '/media/missing.vtt' }] }), { publicDir }), /ENOENT/);
    await writeFile(path.join(mediaDir, 'fake.mp4'), '<html>not video</html>');
    await assert.rejects(validateLocalVideo('/media/fake.mp4', publicDir), /extension/);
    await assert.rejects(validateLocalVideo('/media/demo.mp4?tracking=yes', publicDir), /local/);
    await assert.rejects(validateLocalVideo('/media/../demo.mp4', publicDir), /local/);
    await writeFile(path.join(mediaDir, 'large.mp4'), Buffer.alloc(CONTENT_LIMITS.videoBytes + 1));
    await assert.rejects(validateLocalVideo('/media/large.mp4', publicDir), /25 MiB/);
    await writeFile(path.join(root, 'outside.mp4'), mp4);
    await symlink(path.join(root, 'outside.mp4'), path.join(mediaDir, 'escape.mp4'));
    await assert.rejects(validateLocalVideo('/media/escape.mp4', publicDir), /outside/);
    await writeFile(path.join(mediaDir, 'bad.vtt'), 'not subtitles');
    await assert.rejects(validateLocalCaptions('/media/bad.vtt', publicDir), /WEBVTT/);
    await writeFile(path.join(mediaDir, 'bad.vtt'), vtt + '<script>alert(1)</script>');
    await assert.rejects(validateLocalCaptions('/media/bad.vtt', publicDir), /Executable markup/);
    await writeFile(path.join(mediaDir, 'large.vtt'), 'x'.repeat(CONTENT_LIMITS.captionBytes + 1));
    await assert.rejects(validateLocalCaptions('/media/large.vtt', publicDir), /128 KiB/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('local PDF/TXT attachment links check real files and reject unsupported or escaped downloads', async () => {
  const root = await fixture();
  const publicDir = path.join(root, 'public');
  const mediaDir = path.join(publicDir, 'media');
  try {
    await writeFile(path.join(mediaDir, 'readme.txt'), '公开的示例附件。');
    await writeFile(path.join(mediaDir, 'guide.pdf'), '%PDF-1.7\n% Signature test fixture, not a full PDF');
    await validateLocalAttachment('/media/readme.txt', publicDir);
    await validateLocalAttachment('/media/guide.pdf', publicDir);
    await validateContentSource(source('[说明](/media/readme.txt) 与 [文档][pdf]\n\n[pdf]: /media/guide.pdf'), { publicDir });
    await assert.rejects(validateContentSource(source('[不存在](/media/missing.pdf)'), { publicDir }), /ENOENT/);
    await assert.rejects(validateContentSource(source('[程序](/media/code.js)'), { publicDir }), /supported/);
    await writeFile(path.join(mediaDir, 'fake.pdf'), 'not PDF');
    await assert.rejects(validateLocalAttachment('/media/fake.pdf', publicDir), /extension/);
    await writeFile(path.join(mediaDir, 'binary.txt'), Buffer.from([0, 1, 2]));
    await assert.rejects(validateLocalAttachment('/media/binary.txt', publicDir), /control/);
    await writeFile(path.join(root, 'private.txt'), 'private');
    await symlink(path.join(root, 'private.txt'), path.join(mediaDir, 'escape.txt'));
    await assert.rejects(validateLocalAttachment('/media/escape.txt', publicDir), /outside/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
