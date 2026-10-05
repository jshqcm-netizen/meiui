"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Clock3, Search, FileText, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/site";
export type ContentSummary = {
  slug: string;
  kind: "blog" | "docs";
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  sample: boolean;
};
export function ContentList({
  entries,
  kind,
}: {
  entries: ContentSummary[];
  kind: "blog" | "docs";
}) {
  const params = useSearchParams();
  const router = useRouter();
  const filter = params.get("tag") || "全部";
  const setFilter = (tag: string) =>
    router.replace(
      `/${kind}/${tag === "全部" ? "" : `?tag=${encodeURIComponent(tag)}`}`,
      { scroll: false },
    );
  const [query, setQuery] = useState("");
  const tags = ["全部", ...new Set(entries.flatMap((e) => e.tags))];
  const visible = entries.filter(
    (e) =>
      (filter === "全部" || e.tags.includes(filter)) &&
      `${e.title} ${e.description} ${e.tags.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="collection-toolbar">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v: string) => {
            if (v) setFilter(v);
          }}
          className="filter-group"
          aria-label="按主题筛选"
        >
          {tags.map((t) => (
            <ToggleGroupItem key={t} value={t} aria-label={`筛选${t}`}>
              {t}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="inline-search">
          <Search size={17} />
          <input
            aria-label={kind === "blog" ? "搜索手记" : "搜索文档"}
            placeholder={kind === "blog" ? "搜索手记" : "搜索文档"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="清空搜索" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="collection-count" role="status">
        {visible.length} 篇{kind === "blog" ? "技术手记" : "知识文档"}
      </div>
      <div className={kind === "blog" ? "article-grid" : "docs-grid"}>
        {visible.map((entry, i) => (
          <Link
            key={entry.slug}
            href={`/${kind}/${entry.slug}/`}
            className={kind === "blog" ? "article-card" : "doc-card"}
          >
            {kind === "blog" ? (
              <div
                className={`article-cover cover-${i % 3}`}
                aria-hidden="true"
              >
                <div className="cover-code">
                  {entry.tags.includes("AI")
                    ? "prompt → draft → review"
                    : entry.tags.includes("工程")
                      ? "<build / learn / share>"
                      : "notes.ideas.next()"}
                </div>
                <span className="cover-label">{entry.tags[0]}</span>
                <span className="cover-symbol">
                  {entry.tags.includes("AI") ? "✳" : "{ }"}
                </span>
              </div>
            ) : (
              <div className="doc-icon">
                <FileText size={23} />
              </div>
            )}
            <div className="article-card-body">
              <div className="card-tags">
                {entry.tags.slice(0, 2).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
                {entry.sample && <span className="sample-label">示例内容</span>}
              </div>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
              <div className="article-meta">
                <span>{formatDate(entry.date)}</span>
                <span>
                  <Clock3 size={13} />
                  {entry.readingMinutes} 分钟阅读
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="collection-empty">
          <BookOpen />
          <h2>这里还没有相关内容</h2>
          <p>试试其他主题，或清空搜索关键词</p>
          <button
            onClick={() => {
              setFilter("全部");
              setQuery("");
            }}
          >
            查看全部内容
          </button>
        </div>
      )}
    </>
  );
}
