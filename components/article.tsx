import { withBasePath, prefixContentHtml } from "@/lib/paths";
import Link from "next/link";
import { ChevronLeft, Clock3, CalendarDays, FileCode2 } from "lucide-react";
import type { ContentEntry } from "@/lib/content-types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/site";
import { TableOfContents } from "@/components/table-of-contents";
import { ArticleBody } from "@/components/article-body";
import { prepareReadingHtml } from "@/lib/reading";
export function Article({
  entry,
  related,
}: {
  entry: ContentEntry;
  related: ContentEntry[];
}) {
  return (
    <div className="page article-page">
      <Link href={`/${entry.kind}/`} className="back-link">
        <ChevronLeft size={16} />
        {entry.kind === "blog" ? "所有手记" : "所有文档"}
      </Link>
      <header className="article-header">
        <div className="card-tags">
          {entry.tags.map((t) => (
            <Badge variant="secondary" key={t}>
              {t}
            </Badge>
          ))}
          {entry.sample && <Badge variant="outline">示例内容</Badge>}
        </div>
        <h1 id="article-title">{entry.title}</h1>
        <p>{entry.description}</p>
        <div className="article-meta">
          <span>
            <CalendarDays size={14} />
            {formatDate(entry.date)}
          </span>
          <span>
            <Clock3 size={14} />
            {entry.readingMinutes} 分钟阅读
          </span>
          <span>
            <FileCode2 size={14} />
            Markdown
          </span>
        </div>
      </header>
      <div className="article-layout">
        <aside className="article-aside">
          <TableOfContents headings={entry.headings} />
          <div className="related-box">
            <h2>接着读</h2>
            {related.slice(0, 2).map((r) => (
              <Link key={r.slug} href={`/${r.kind}/${r.slug}/`}>
                {r.title}
                <span>{r.readingMinutes} 分钟阅读</span>
              </Link>
            ))}
          </div>
        </aside>
        <article className="reading-surface" aria-labelledby="article-title">
          {entry.sample && (
            <div className="sample-notice">
              这是一篇用于展示结构与阅读体验的示例内容，发布前请替换或审阅。
            </div>
          )}
          <ArticleBody html={prepareReadingHtml(prefixContentHtml(entry.html))} />
          {entry.videos?.length ? (
            <section className="article-videos" aria-label="视频示例">
              <h2>视频演示</h2>
              {entry.videos.map((video) => (
                <figure key={video.src}>
                  <h3>{video.title}</h3>
                  <video
                    controls
                    preload="metadata"
                    poster={video.poster ? withBasePath(video.poster) : undefined}
                    aria-label={video.title}
                    playsInline
                  >
                    <source
                      src={withBasePath(video.src)}
                      type={
                        video.src.endsWith(".webm") ? "video/webm" : "video/mp4"
                      }
                    />
                    {video.captions && (
                      <track
                        kind="captions"
                        src={withBasePath(video.captions)}
                        srcLang="zh"
                        label="中文字幕"
                        default
                      />
                    )}
                    你的浏览器不支持视频，请使用支持 HTML5 的浏览器。
                  </video>
                  <figcaption>{video.caption}</figcaption>
                </figure>
              ))}
            </section>
          ) : null}
          <footer className="article-end">
            <span>读到这里，谢谢你的时间。</span>
            <Link href={`/${entry.kind}/`}>继续探索</Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
