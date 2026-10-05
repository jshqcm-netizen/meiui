#!/usr/bin/env node
/** Local authoring only. This command never uploads, commits, pushes or deploys. */
import { mkdir, readFile, realpath, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { isContentSlug, loadAllContent, parseContentSource, validateContentSource } from '../lib/content';
import { createContentPreview } from '../lib/content-preview';
import type { ContentKind, ContentMetadata, ContentStatus } from '../lib/content-types';

const HELP = `QCM local content workflow
  npm run content:new -- --kind blog --slug my-note --title "标题"
  npm run content:check
  npm run content:preview -- --kind blog --slug my-note
  npm run content:status
  npm run content:status -- --kind blog --slug my-note --to review
  npm run content:status -- --kind blog --slug my-note --to published --approve

new: optional --description "摘要" --date YYYY-MM-DD --sample
Publication is a local metadata change only. --approve represents explicit human approval.
`;

type Options = Record<string, string | boolean>;
function parseArgs(args: string[], allowed: string[]): Options {
  const options: Options = {};
  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    if (!token.startsWith('--') || !allowed.includes(token.slice(2))) throw new Error(`Unknown option: ${token}`);
    const key = token.slice(2);
    if (key in options) throw new Error(`Repeated option: ${token}`);
    if (['approve', 'sample'].includes(key)) options[key] = true;
    else {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
      options[key] = value;
    }
  }
  return options;
}
function target(options: Options): { kind: ContentKind; slug: string; filename: string } {
  const kind = options.kind;
  const slug = options.slug;
  if (kind !== 'blog' && kind !== 'docs') throw new Error('--kind must be blog or docs');
  if (typeof slug !== 'string' || !isContentSlug(slug)) throw new Error('--slug must contain lowercase letters/numbers separated by single hyphens (max 80 characters)');
  return { kind, slug, filename: path.join(process.cwd(), 'content', kind, `${slug}.md`) };
}
function serialize(metadata: ContentMetadata, body: string): string {
  return `---\n${stringify(metadata, { lineWidth: 0 }).trim()}\n---\n\n${body.trim()}\n`;
}
async function checkTargetContainment(filename: string, mustExist: boolean): Promise<void> {
  const root = await realpath(path.join(process.cwd(), 'content'));
  const directory = await realpath(path.dirname(filename));
  const candidate = mustExist ? await realpath(filename) : path.join(directory, path.basename(filename));
  const relative = path.relative(root, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('Content target resolves outside content/');
}

export async function runContentCli(args: string[]): Promise<void> {
  const [command, ...rest] = args;
  if (!command || command === '--help' || command === 'help') { console.log(HELP); return; }
  if (command === 'new') {
    const options = parseArgs(rest, ['kind', 'slug', 'title', 'description', 'date', 'sample']);
    const { kind, slug, filename } = target(options);
    await checkTargetContainment(filename, false);
    const metadata: ContentMetadata = {
      title: typeof options.title === 'string' ? options.title : slug,
      description: typeof options.description === 'string' ? options.description : '这是一篇等待补充摘要与核实内容的草稿。',
      slug, kind,
      date: typeof options.date === 'string' ? options.date : new Date().toISOString().slice(0, 10),
      tags: ['待整理'], status: 'draft', sample: options.sample === true,
    };
    const body = '## 写作目标\n\n说明这篇内容能帮助读者完成什么。\n\n## 核实清单\n\n- [ ] 事实和来源已核实\n- [ ] 没有密钥或未经授权的个人信息\n- [ ] 示例、限制和操作步骤已说明\n- [ ] 由人确认发布范围';
    const source = serialize(metadata, body);
    await validateContentSource(source, { expectedKind: kind, expectedSlug: slug, sourceName: filename });
    await writeFile(filename, source, { encoding: 'utf8', flag: 'wx' });
    console.log(`Created draft: content/${kind}/${slug}.md`);
    return;
  }
  if (command === 'preview') {
    const options = parseArgs(rest, ['kind', 'slug']);
    const { kind, slug, filename } = target(options);
    await checkTargetContainment(filename, true);
    const { entry, html, sourceHash } = await createContentPreview(await readFile(filename, 'utf8'), { expectedKind: kind, expectedSlug: slug, sourceName: filename });
    const previewDir = path.join(process.cwd(), '.content-preview');
    await mkdir(previewDir, { recursive: true });
    if (await realpath(previewDir) !== path.resolve(previewDir)) throw new Error('Preview directory must not be a symlink');
    const output = path.join(previewDir, `${kind}-${slug}.html`);
    // The preview lives outside public/ and out/. It is never part of the site export.
    const temporary = `${output}.${process.pid}.tmp`;
    await writeFile(temporary, html, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, output);
    console.log(`Validated ${entry.status}: content/${kind}/${slug}.md\nLocal preview: ${output}\nSource SHA-256: ${sourceHash}\nReview this exact version; publication needs separate approval.`);
    return;
  }
  if (command === 'status') {
    const options = parseArgs(rest, ['kind', 'slug', 'to', 'approve']);
    if (Object.keys(options).length === 0) {
      const entries = await loadAllContent();
      for (const entry of entries) console.log(`${entry.status.padEnd(9)} ${entry.kind.padEnd(4)} ${entry.slug}${entry.sample ? ' [sample]' : ''}`);
      return;
    }
    const { kind, slug, filename } = target(options);
    await checkTargetContainment(filename, true);
    const next = options.to;
    if (next !== 'draft' && next !== 'review' && next !== 'published') throw new Error('--to must be draft, review or published');
    const source = await readFile(filename, 'utf8');
    const current = await validateContentSource(source, { expectedKind: kind, expectedSlug: slug, sourceName: filename });
    if (next === 'published' && options.approve !== true) throw new Error('Publication needs explicit human approval. Use --approve only after the owner approves this exact content.');
    if (next === 'published' && current.status === 'draft') throw new Error('Move draft → review, complete human review, then use published --approve');
    if (current.status === next) throw new Error(`Content is already ${next}`);
    const { metadata, body } = parseContentSource(source);
    metadata.status = next as ContentStatus;
    const updated = serialize(metadata, body);
    await validateContentSource(updated, { expectedKind: kind, expectedSlug: slug, sourceName: filename });
    const temporary = `${filename}.${process.pid}.tmp`;
    await writeFile(temporary, updated, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, filename);
    console.log(`${current.status} → ${next}: content/${kind}/${slug}.md\nLocal change only; nothing was uploaded or deployed.`);
    return;
  }
  throw new Error(`Unknown command: ${command}\n${HELP}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runContentCli(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
