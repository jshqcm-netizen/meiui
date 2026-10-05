/** Local authoring only. Never import into a page, public route or Client Component. */
import { createHash } from 'node:crypto';
import { validateContentSource, type ValidateContentOptions } from './content';
import type { ContentEntry } from './content-types';

// A small, standalone reading surface using the existing app/globals.css palette.
// System fonts keep file-based review offline; no site bundle or font is loaded.
const styles = `
:root{color-scheme:light;--background:#edf0f7;--foreground:#253048;--card:#f8faff;--primary:#3e56cf;--muted:#5d6881;--border:#d7deed;--font-sans:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",system-ui,sans-serif;--font-mono:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
*{box-sizing:border-box}html{scroll-padding-top:24px}body{margin:0;background:var(--background);color:var(--foreground);font:16px/1.85 var(--font-sans);-webkit-font-smoothing:antialiased}a{color:var(--primary);text-underline-offset:3px}a:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--primary);outline-offset:4px}::selection{background:#d0dbfb}h1,h2,h3,h4,h5,h6,p{margin:0}code{font-family:var(--font-mono)}.skip-link{position:absolute;left:16px;top:-100px;background:var(--card);padding:10px 16px;z-index:1}.skip-link:focus{top:12px}
.preview-shell{max-width:1140px;margin:0 auto;padding:32px 28px 56px}.preview-bar{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px 24px;margin-bottom:18px}.brand{font-size:22px;font-weight:750;letter-spacing:-.6px}.brand span{color:var(--muted);font-weight:500}.preview-bar p{color:var(--muted);font-size:13px}.review-notice{border-left:3px solid var(--primary);padding:12px 18px;margin-bottom:26px;background:var(--card);border-radius:0 12px 12px 0;font-size:14px}.review-notice strong{font-weight:650}.review-notice p{color:var(--muted);margin-top:3px}.preview-layout{display:grid;grid-template-columns:minmax(0,1fr) 220px;grid-template-areas:"article sidebar";gap:28px;align-items:start}.reading-surface{grid-area:article;min-width:0;padding:36px 40px;background:var(--card);border:1px solid #fff;border-radius:24px}.review-sidebar{grid-area:sidebar;position:sticky;top:24px;max-height:calc(100vh - 48px);overflow:auto;overscroll-behavior:contain;padding:8px 4px;overflow-wrap:anywhere}
.badges{display:flex;flex-wrap:wrap;gap:8px}.badge{display:inline-block;padding:3px 10px;border-radius:7px;background:var(--background);color:var(--muted);font-size:12px;font-weight:600}.status-badge{color:var(--primary);border:1px solid var(--border)}.sample-badge{color:var(--foreground);border:1px dashed var(--muted)}.article-header h1{font-size:clamp(26px,3.2vw,34px);line-height:1.5;letter-spacing:-.6px;margin-top:16px;overflow-wrap:anywhere}.description{font-size:16px;color:var(--muted);margin-top:12px;max-width:65ch;overflow-wrap:anywhere}.article-meta{display:flex;flex-wrap:wrap;gap:6px 18px;color:var(--muted);font-size:13px;margin-top:20px;padding-bottom:22px;border-bottom:1px solid var(--border)}.tags{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:14px 0 0;padding:0;font-size:12px;color:var(--muted)}.tags li{padding:2px 8px;background:var(--background);border-radius:5px;overflow-wrap:anywhere}.sample-notice{margin-top:20px;padding:10px 14px;background:var(--background);border-radius:9px;font-size:13px;color:var(--muted)}
.prose{max-width:75ch;margin-top:26px;overflow-wrap:anywhere;line-height:1.95}.prose :is(h1,h2,h3,h4,h5,h6){color:var(--foreground);line-height:1.6;scroll-margin-top:24px;margin:30px 0 12px;font-weight:650}.prose h1{font-size:27px}.prose h2{font-size:22px}.prose h3{font-size:18px}.prose :is(h4,h5,h6){font-size:16px}.prose :is(h1,h2,h3,h4,h5,h6):target{border-left:3px solid var(--primary);padding-left:12px}.prose p{margin:15px 0}.prose :is(ul,ol){padding-left:24px;margin:16px 0}.prose li{margin:6px 0}.prose li>p{margin:6px 0}.prose .contains-task-list{list-style:none;padding-left:0}.prose input[type=checkbox]{margin-right:8px;accent-color:var(--primary)}.prose code{font-size:.86em;background:var(--background);padding:3px 5px;border-radius:4px}.prose pre{max-width:100%;overflow:auto;overscroll-behavior:contain;background:#25334d;color:#dce6fa;border:1px solid #334460;border-radius:12px;padding:18px 20px;font-size:13px;line-height:1.85;margin:22px 0;tab-size:2}.prose pre code{padding:0;background:transparent;font-size:inherit;overflow-wrap:normal;word-break:normal}.prose blockquote{margin:23px 0;padding:2px 20px;border-left:3px solid #91a6db;background:var(--background);color:var(--muted)}.table-scroll{overflow:auto;overscroll-behavior:contain;max-width:100%;margin:24px 0;border:1px solid var(--border);border-radius:10px}.prose table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.7}.prose :is(th,td){border:1px solid var(--border);padding:10px 13px;min-width:110px;text-align:left;overflow-wrap:normal}.prose th{background:var(--background);font-weight:650}.prose img{display:block;max-width:100%;height:auto;border-radius:12px;margin:22px 0}.prose hr{border:0;border-top:1px solid var(--border);margin:28px 0}
.toc summary{cursor:pointer;font-weight:650;font-size:14px}.toc nav{margin-top:14px}.toc ol{list-style:none;padding:0;margin:0}.toc li{margin:2px 0}.toc a{display:block;padding:7px 8px;border-left:1px solid var(--border);color:var(--muted);font-size:13px;line-height:1.7;text-decoration:none}.toc a:hover{color:var(--primary);border-color:var(--primary)}.toc .depth-1{padding-left:20px}.toc .depth-2{padding-left:32px}.toc .depth-3,.toc .depth-4,.toc .depth-5{padding-left:40px}.toc-empty{margin-top:12px;color:var(--muted);font-size:13px}.review-version{margin-top:26px;padding-top:20px;border-top:1px solid var(--border);color:var(--muted);font-size:12px}.review-version p{margin:8px 0}.review-version code{display:block;overflow-wrap:anywhere;font-size:11px;line-height:1.8}.review-version summary{cursor:pointer;font-size:12px}.article-videos{border-top:1px solid var(--border);margin-top:32px;padding-top:26px}.article-videos h2{font-size:22px}.article-videos h3{font-size:17px;margin-bottom:12px}.article-videos figure{margin:22px 0 0}.article-videos video{display:block;width:100%;max-height:560px;border-radius:12px;background:#25334d}.article-videos figcaption{font-size:13px;color:var(--muted);margin-top:10px;overflow-wrap:anywhere}.article-end{margin-top:32px;padding-top:18px;border-top:1px solid var(--border);font-size:13px;color:var(--muted)}
@media(max-width:800px){.preview-shell{padding:20px 16px 36px}.preview-layout{grid-template-columns:minmax(0,1fr);grid-template-areas:"sidebar" "article";gap:20px}.review-sidebar{position:static;max-height:none;padding:0 8px}.toc nav{max-height:240px;overflow:auto;padding:4px}.review-version{margin-top:16px;padding-top:12px}.reading-surface{padding:26px 24px;border-radius:20px}.preview-bar p{font-size:12px}}
@media(max-width:420px){.preview-shell{padding:16px 12px 28px}.reading-surface{padding:24px 18px}.prose pre{padding:16px;font-size:12px}.review-notice{padding:10px 14px}.article-header h1{font-size:26px}}
@media print{body{background:white}.preview-shell{max-width:none;padding:0}.preview-layout{display:block}.review-sidebar,.skip-link{display:none}.reading-surface{border:0;padding:16px 0}.prose pre{white-space:pre-wrap;overflow-wrap:anywhere}.table-scroll{overflow:visible}.article-end{break-inside:avoid}}
`;

const statusLabels = { draft: '草稿', review: '待审核', published: '已标记公开' } as const;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

/** Assets have already passed the shared validator. This changes only their preview location. */
function localAssetUrl(url: string): string {
  return escapeHtml(url.replace(/^\/media\//, '../public/media/'));
}

function readingBody(html: string): string {
  // Match actual generated tags, never code/text that merely describes href or src.
  return html.replace(/<(?:a|img)\b[^>]*>/g, (tag) => tag.replace(/\b(href|src)="\/media\//g, '$1="../public/media/'))
    .replace(/<pre>/g, '<pre tabindex="0" role="region" aria-label="代码示例，可横向滚动">')
    .replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="表格，可横向滚动"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

function renderVideos(entry: ContentEntry): string {
  if (!entry.videos?.length) return '';
  return `<section class="article-videos" id="preview-videos" aria-labelledby="preview-videos-title"><h2 id="preview-videos-title">视频与说明</h2>${entry.videos.map((video) => `<figure><h3>${escapeHtml(video.title)}</h3><video controls preload="metadata" aria-label="${escapeHtml(video.title)}"${video.poster ? ` poster="${localAssetUrl(video.poster)}"` : ''}><source src="${localAssetUrl(video.src)}" type="${video.src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'}">${video.captions ? `<track kind="captions" src="${localAssetUrl(video.captions)}" srclang="zh-CN" label="中文字幕">` : ''}你的浏览器不支持此视频。<a href="${localAssetUrl(video.src)}">打开本地视频</a></video><figcaption>${escapeHtml(video.caption)}</figcaption></figure>`).join('')}</section>`;
}

/** Always validates the exact source before rendering. No unchecked-HTML entry point. */
export async function createContentPreview(source: string, options: ValidateContentOptions = {}): Promise<{ entry: ContentEntry; html: string; sourceHash: string }> {
  const entry = await validateContentSource(source, options);
  const sourceHash = createHash('sha256').update(source, 'utf8').digest('hex');
  const styleHash = createHash('sha256').update(styles, 'utf8').digest('base64');
  const csp = `default-src 'none'; script-src 'none'; style-src 'sha256-${styleHash}'; img-src 'self' file:; media-src 'self' file:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'`;
  const firstLevel = Math.min(...entry.headings.map((heading) => heading.level));
  const tocItems = entry.headings.map((heading) => `<li><a class="depth-${heading.level - firstLevel}" href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text || '（空标题）')}</a></li>`).join('');
  const toc = tocItems || entry.videos?.length
    ? `<nav aria-label="文章目录"><ol>${tocItems}${entry.videos?.length ? '<li><a href="#preview-videos">视频与说明</a></li>' : ''}</ol></nav>`
    : '<p class="toc-empty">正文还没有标题。可添加 Markdown 标题，便于逐节审核。</p>';
  const sourcePath = `content/${entry.kind}/${entry.slug}.md`;
  const html = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>${escapeHtml(entry.title)} · 本地预览</title><style>${styles}</style></head>
<body><a class="skip-link" href="#preview-article">跳到正文</a><div class="preview-shell">
<header class="preview-bar"><div class="brand">qcm<span>.dev</span></div><p>本地内容预览 · 不会自动发布</p></header>
<section class="review-notice" aria-label="本地审核提示"><strong>阅读这份内容，再决定下一步</strong><p>预览只保存在 .content-preview/，不会进入站点导出。内容审核与发布批准是独立步骤。</p></section>
<div class="preview-layout">
<aside class="review-sidebar" aria-label="目录与版本"><details class="toc" open><summary>文章目录</summary>${toc}</details><section class="review-version" aria-label="审核版本"><strong>核对当前版本</strong><p>${escapeHtml(sourcePath)}</p><details><summary>源文件 SHA-256：${sourceHash.slice(0, 12)}</summary><code>${sourceHash}</code></details><p>指纹仅标识本次 Markdown 快照，不是批准记录；媒体变化也需要重新审核。</p><p>源文件修改后请重新生成预览。站内页面链接需在开发站点核对。</p></section></aside>
<main class="reading-surface" id="preview-article" tabindex="-1"><article aria-labelledby="preview-title"><header class="article-header"><div class="badges"><span class="badge">${entry.kind === 'blog' ? '博客' : '文档'}</span><span class="badge status-badge">${statusLabels[entry.status]} · ${entry.status}</span>${entry.sample ? '<span class="badge sample-badge">示例内容 · SAMPLE</span>' : ''}</div><h1 id="preview-title">${escapeHtml(entry.title)}</h1><p class="description">${escapeHtml(entry.description)}</p><div class="article-meta"><span>日期 <time datetime="${entry.date}">${entry.date}</time></span>${entry.updated ? `<span>更新 <time datetime="${entry.updated}">${entry.updated}</time></span>` : ''}<span>阅读约 ${entry.readingMinutes} 分钟</span></div><ul class="tags" aria-label="内容标签">${entry.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul></header>${entry.sample ? '<p class="sample-notice">这是一份示例内容，用于演示结构或流程，不代表真实经历或已经上线的成果。</p>' : ''}<div class="prose">${readingBody(entry.html)}</div>${renderVideos(entry)}<footer class="article-end">检查事实、来源、代码与媒体后，请内容所有者审核当前版本。<br><a href="#preview-title">回到标题</a></footer></article></main>
</div></div></body></html>`;
  return { entry, html, sourceHash };
}
