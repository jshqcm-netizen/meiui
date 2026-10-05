import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { stringify } from 'yaml';
import { getAllContent, getSearchIndex, parseContentSource } from '../lib/content';
import { createContentPreview } from '../lib/content-preview';
import { runContentCli } from '../scripts/content';

function source(body = '## 开始审核\n\n这是一份独立预览的测试文稿。', changes: Record<string, unknown> = {}): string {
  return `---\n${stringify({
    title: '独立内容预览', description: '用于检查本地审核体验与内容安全边界的测试文稿。',
    slug: 'preview-note', kind: 'blog', date: '2026-10-05', tags: ['审核'], status: 'draft', sample: true,
    ...changes,
  })}---\n\n${body}\n`;
}

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'qcm-preview-'));
  await Promise.all(['content/blog', 'content/docs', 'public/media/nested', 'out'].map((directory) => mkdir(path.join(root, directory), { recursive: true })));
  return root;
}

test('preview uses cool-blue reading tokens, real heading IDs and usable code/table regions', async () => {
  const { entry, html } = await createContentPreview(source('## 起步\n\n### 安全 & 可用\n\n## 起步\n\n| 命令 | 结果 |\n| --- | --- |\n| 检查 | 通过 |\n\n```html\n<script>example()</script>\n```'));
  assert.match(html, /--background:#edf0f7/);
  assert.match(html, /--primary:#3e56cf/);
  assert.match(html, /<nav aria-label="文章目录">/);
  for (const heading of entry.headings) {
    assert.ok(html.includes(`href="#${heading.id}"`));
    assert.ok(html.includes(`id="${heading.id}"`));
  }
  assert.match(html, /class="depth-1" href="#section-安全-可用">安全 &amp; 可用/);
  assert.match(html, /<pre tabindex="0" role="region" aria-label="代码示例，可横向滚动">/);
  assert.match(html, /<div class="table-scroll" tabindex="0" role="region" aria-label="表格，可横向滚动"><table>/);
  assert.match(html, /<\/table><\/div>/);
  assert.match(html, /&#x3C;script>|&lt;script>/);
  assert.doesNotMatch(html, /<script\b/i);
});

test('preview status, sample, metadata and empty outline are explicit and escaped', async () => {
  const { html } = await createContentPreview(source('没有标题的正文。', {
    title: '</title><script>evil()</script>', description: '这是一段包含 <标记> 与 & 字符的安全元数据。',
    tags: ['<审核>'], status: 'review', updated: '2026-10-06',
  }));
  assert.match(html, /待审核 · review/);
  assert.match(html, /示例内容 · SAMPLE/);
  assert.match(html, /这是一份示例内容/);
  assert.match(html, /&lt;\/title&gt;&lt;script&gt;evil\(\)&lt;\/script&gt;/);
  assert.match(html, /<li>&lt;审核&gt;<\/li>/);
  assert.match(html, /datetime="2026-10-06"/);
  assert.match(html, /正文还没有标题/);
  assert.doesNotMatch(html, /<script\b|depth-Infinity|depth-NaN/i);
  const actual = await createContentPreview(source(undefined, { sample: false, status: 'published' }));
  assert.match(actual.html, /已标记公开 · published/);
  assert.doesNotMatch(actual.html, /class="badge sample-badge"|class="sample-notice"/);
  assert.match(actual.html, /本地内容预览 · 不会自动发布/);
});

test('CSP allows only the exact inline stylesheet and no scripts, external resources or active embeds', async () => {
  const { html } = await createContentPreview(source('[外部引用](https://example.com/source)'));
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
  assert.ok(css);
  const styleHash = createHash('sha256').update(css).digest('base64');
  assert.ok(html.includes(`style-src 'sha256-${styleHash}'`));
  for (const directive of ["default-src 'none'", "script-src 'none'", "connect-src 'none'", "object-src 'none'", "frame-src 'none'", "base-uri 'none'", "form-action 'none'", "img-src 'self' file:", "media-src 'self' file:"]) assert.ok(html.includes(directive), directive);
  assert.doesNotMatch(html, /unsafe-inline|unsafe-eval|<script\b|<iframe\b|<object\b|<embed\b|<link\b|@import|@font-face|url\(/i);
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.match(html, /href="https:\/\/example.com\/source"/);
});

test('source fingerprint identifies the exact reviewed Markdown and changes after edits', async () => {
  const original = source();
  const first = await createContentPreview(original);
  const same = await createContentPreview(original);
  const edited = await createContentPreview(`${original}\n`);
  assert.equal(first.sourceHash, createHash('sha256').update(original).digest('hex'));
  assert.equal(first.html, same.html);
  assert.notEqual(first.sourceHash, edited.sourceHash);
  assert.match(first.html, new RegExp(`<code>${first.sourceHash}</code>`));
  assert.match(first.html, /不是批准记录；媒体变化也需要重新审核/);
});

test('file previews resolve image, PDF, TXT, linked media, video, poster and captions without changing literal code', async () => {
  const root = await fixture();
  const publicDir = path.join(root, 'public');
  const mediaDir = path.join(publicDir, 'media');
  try {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFncAAAAASUVORK5CYII=', 'base64');
    await writeFile(path.join(mediaDir, 'poster.png'), png);
    await writeFile(path.join(mediaDir, 'demo.mp4'), Buffer.from('000000186674797069736f6d0000020069736f3261766331', 'hex'));
    await writeFile(path.join(mediaDir, 'demo.vtt'), 'WEBVTT\n\n00:00.000 --> 00:02.000\n审核示例。\n');
    await writeFile(path.join(mediaDir, 'nested/guide.pdf'), '%PDF-1.7\n% Test signature only');
    await writeFile(path.join(mediaDir, 'readme.txt'), '公开示例附件');
    const body = '## 资源\n\n![图片说明](/media/poster.png)\n\n[PDF](/media/nested/guide.pdf) [TXT][text] [视频](/media/demo.mp4) [字幕](/media/demo.vtt) [图片](/media/poster.png) [站内页](/docs/getting-started/) [锚点](#section-资源)\n\n[text]: /media/readme.txt\n\n`href="/media/readme.txt"` 和 `src="/media/poster.png"`\n\n```html\n<a href="/media/readme.txt">示例</a>\n<img src="/media/poster.png">\n```';
    const { html } = await createContentPreview(source(body, { videos: [{
      src: '/media/demo.mp4', title: '视频 & 审核', caption: '本地测试视频。', hasSpeech: true,
      poster: '/media/poster.png', captions: '/media/demo.vtt',
    }] }), { publicDir });
    for (const asset of ['nested/guide.pdf', 'readme.txt', 'demo.mp4', 'demo.vtt', 'poster.png']) assert.ok(html.includes(`href="../public/media/${asset}"`), asset);
    assert.match(html, /src="\.\.\/public\/media\/poster.png"/);
    assert.match(html, /poster="\.\.\/public\/media\/poster.png"/);
    assert.match(html, /<source src="\.\.\/public\/media\/demo.mp4"/);
    assert.match(html, /<track kind="captions" src="\.\.\/public\/media\/demo.vtt"/);
    assert.match(html, /href="#preview-videos"/);
    assert.match(html, /aria-label="视频 &amp; 审核"/);
    assert.match(html, /<code>href="\/media\/readme.txt"<\/code>/);
    assert.match(html, /<code>src="\/media\/poster.png"<\/code>/);
    assert.match(html, /&#x3C;a href="\/media\/readme.txt"/);
    assert.match(html, /href="\/docs\/getting-started\/"/);
    assert.match(html, /href="#section-资源"/);
    const previewUrl = pathToFileURL(path.join(root, '.content-preview/blog-preview-note.html'));
    for (const match of html.matchAll(/(?:href|src|poster)="(\.\.\/public\/media\/[^\"]+)"/g)) await access(new URL(match[1], previewUrl));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('preview renderer cannot bypass source or asset validation', async () => {
  for (const body of ['<script>evil()</script>', '[危险](javascript:alert%281%29)', '![远程](https://example.com/tracker.png)', '[附件](/media/../private.txt)']) {
    await assert.rejects(createContentPreview(source(body)), body);
  }
  await assert.rejects(createContentPreview(source(), { expectedSlug: 'another-slug' }), /filename/);
  await assert.rejects(createContentPreview(source('[附件](/media/missing.txt)')), /ENOENT/);
});

test('CLI only writes an isolated preview and preserves previous review when validation fails', async () => {
  const root = await fixture();
  const previousCwd = process.cwd();
  try {
    process.chdir(root);
    const filename = path.join(root, 'content/blog/preview-note.md');
    const draft = source('## 私有审核\n\nprivate-preview-marker');
    await writeFile(filename, draft);
    await writeFile(path.join(root, 'out/index.html'), 'existing public export');
    const publicBefore = await readdir(path.join(root, 'public'), { recursive: true });
    await runContentCli(['preview', '--kind', 'blog', '--slug', 'preview-note']);
    const output = path.join(root, '.content-preview/blog-preview-note.html');
    const firstPreview = await readFile(output, 'utf8');
    assert.match(firstPreview, /private-preview-marker/);
    assert.equal(await readFile(filename, 'utf8'), draft);
    assert.equal(parseContentSource(await readFile(filename, 'utf8')).metadata.status, 'draft');
    assert.deepEqual(await readdir(path.join(root, 'public'), { recursive: true }), publicBefore);
    assert.deepEqual(await readdir(path.join(root, 'out')), ['index.html']);
    assert.equal(await readFile(path.join(root, 'out/index.html'), 'utf8'), 'existing public export');
    assert.deepEqual(await getAllContent(), []);
    assert.deepEqual(await getSearchIndex(), []);
    await writeFile(filename, source('<script>unsafe()</script>'));
    await assert.rejects(runContentCli(['preview', '--kind', 'blog', '--slug', 'preview-note']), /Raw HTML/);
    assert.equal(await readFile(output, 'utf8'), firstPreview);
    assert.deepEqual(await readdir(path.dirname(output)), ['blog-preview-note.html']);
  } finally { process.chdir(previousCwd); await rm(root, { recursive: true, force: true }); }
});

test('CLI refuses a preview directory symlink into a public location', async () => {
  const root = await fixture();
  const previousCwd = process.cwd();
  try {
    process.chdir(root);
    await writeFile(path.join(root, 'content/blog/preview-note.md'), source());
    await symlink(path.join(root, 'public'), path.join(root, '.content-preview'));
    await assert.rejects(runContentCli(['preview', '--kind', 'blog', '--slug', 'preview-note']), /must not be a symlink/);
    assert.deepEqual(await readdir(path.join(root, 'public')), ['media']);
  } finally { process.chdir(previousCwd); await rm(root, { recursive: true, force: true }); }
});
