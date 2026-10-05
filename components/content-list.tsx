"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, LayoutGrid, List, Search, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CollectionCards } from "@/components/collection-cards";
import {
  ALL_TOPICS,
  collectionTopicHref,
  collectionTopics,
  selectCollection,
  type CollectionSort,
  type CollectionView,
  type ContentSummary,
} from "@/lib/collection";
import styles from "./collection.module.css";
export type { ContentSummary } from "@/lib/collection";

const sortLabels: Record<CollectionSort, string> = {
  newest: "最新发布",
  oldest: "最早发布",
  shortest: "阅读时间最短",
  title: "标题顺序",
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
  const filter = params.get("tag") || ALL_TOPICS;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CollectionSort>("newest");
  const [view, setView] = useState<CollectionView>("grid");
  const tags = collectionTopics(entries);
  const visible = selectCollection(entries, { tag: filter, query, sort });
  const hasFilters = filter !== ALL_TOPICS || Boolean(query.trim());
  const label = kind === "blog" ? "技术手记" : "知识文档";
  const setFilter = (tag: string) =>
    router.replace(collectionTopicHref(kind, params.toString(), tag), {
      scroll: false,
    });
  const resetFilters = () => {
    setFilter(ALL_TOPICS);
    setQuery("");
  };
  return (
    <section className={styles.explorer} aria-label={`${label}浏览器`}>
      <div className={styles.explorerHeading}>
        <div>
          <h2>全部{label}</h2>
          <p>
            {kind === "blog"
              ? "按兴趣找一篇，也可以从最新的开始。"
              : "按主题查找，随时回来继续阅读。"}
          </p>
        </div>
        <span className={styles.topicHint}>主题篇数按全部内容统计</span>
      </div>
      <div className={styles.controls}>
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value: string) => {
            if (value) setFilter(value);
          }}
          className={styles.topicFilters}
          aria-label="按主题筛选"
        >
          {tags.map(({ tag, count }) => (
            <ToggleGroupItem
              key={tag}
              value={tag}
              aria-label={`筛选${tag}`}
              aria-description={`${count} 篇${label}`}
            >
              {tag}
              <span className={styles.topicCount} aria-hidden="true">
                {count}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <Search aria-hidden="true" />
            <Input
              aria-label={kind === "blog" ? "搜索手记" : "搜索文档"}
              placeholder="搜索标题、简介或主题"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="清空搜索"
                onClick={() => setQuery("")}
              >
                <X />
              </Button>
            )}
          </div>
          <div className={styles.viewControls}>
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as CollectionSort)}
            >
              <SelectTrigger
                aria-label="内容排序"
                className={styles.sortTrigger}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(sortLabels).map(([value, title]) => (
                    <SelectItem key={value} value={value}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value: string) => {
                if (value === "grid" || value === "list") setView(value);
              }}
              aria-label="内容视图"
              className={styles.viewToggle}
            >
              <ToggleGroupItem
                value="grid"
                aria-label="网格视图"
                title="网格视图"
              >
                <LayoutGrid />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="列表视图"
                title="列表视图"
              >
                <List />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className={styles.resultBar}>
        <p role="status" aria-live="polite" aria-atomic="true">
          {hasFilters
            ? `找到 ${visible.length} 篇，共 ${entries.length} 篇`
            : `${visible.length} 篇${label}`}
          {filter !== ALL_TOPICS && <span>主题：{filter}</span>}
          {query.trim() && <span>关键词：{query.trim()}</span>}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            重置筛选
            <X data-icon="inline-end" />
          </Button>
        ) : (
          <span>
            {kind === "docs" && view === "grid"
              ? "按首个主题分组"
              : sortLabels[sort]}
          </span>
        )}
      </div>
      {visible.length ? (
        <CollectionCards
          entries={visible}
          kind={kind}
          view={view}
          grouped={kind === "docs" && filter === ALL_TOPICS}
        />
      ) : (
        <Empty className={styles.empty}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>
              <h3>
                {entries.length
                  ? "这里还没有相关内容"
                  : "这里的内容还在慢慢生长"}
              </h3>
            </EmptyTitle>
            <EmptyDescription>
              {entries.length
                ? "换一个关键词，或清空筛选，看看其他主题。"
                : "公开发布后，新的内容会出现在这里。"}
            </EmptyDescription>
          </EmptyHeader>
          {entries.length > 0 && (
            <EmptyContent>
              <Button variant="outline" onClick={resetFilters}>
                查看全部内容
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </section>
  );
}
