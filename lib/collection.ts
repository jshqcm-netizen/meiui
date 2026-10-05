import type { ContentEntry, ContentKind } from "./content-types";

/** Only public, display-safe metadata is passed to the collection explorer. */
export type ContentSummary = Pick<
  ContentEntry,
  | "slug"
  | "kind"
  | "title"
  | "description"
  | "date"
  | "tags"
  | "readingMinutes"
  | "sample"
>;
export type CollectionSort = "newest" | "oldest" | "shortest" | "title";
export type CollectionView = "grid" | "list";
export const ALL_TOPICS = "全部";

export function toContentSummary(entry: ContentSummary): ContentSummary {
  const { slug, kind, title, description, date, tags, readingMinutes, sample } =
    entry;
  return {
    slug,
    kind,
    title,
    description,
    date,
    tags: [...tags],
    readingMinutes,
    sample,
  };
}

function normalizeQuery(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

/** Topic counts describe the full public collection, unaffected by search. */
export function collectionTopics(
  entries: readonly ContentSummary[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of new Set(entry.tags))
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [
    { tag: ALL_TOPICS, count: entries.length },
    ...Array.from(counts, ([tag, count]) => ({ tag, count })),
  ];
}

export function selectCollection(
  entries: readonly ContentSummary[],
  {
    tag = ALL_TOPICS,
    query = "",
    sort = "newest",
  }: {
    tag?: string;
    query?: string;
    sort?: CollectionSort;
  } = {},
): ContentSummary[] {
  const terms = normalizeQuery(query).split(/\s+/).filter(Boolean);
  const visible = entries.filter((entry) => {
    if (tag !== ALL_TOPICS && !entry.tags.includes(tag)) return false;
    const haystack = normalizeQuery(
      `${entry.title} ${entry.description} ${entry.tags.join(" ")}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
  const byTitle = (a: ContentSummary, b: ContentSummary) =>
    a.title.localeCompare(b.title, "zh-CN", { numeric: true }) ||
    a.slug.localeCompare(b.slug);
  return visible.sort((a, b) => {
    if (sort === "title") return byTitle(a, b);
    if (sort === "shortest")
      return (
        a.readingMinutes - b.readingMinutes ||
        b.date.localeCompare(a.date) ||
        byTitle(a, b)
      );
    if (sort === "oldest") return a.date.localeCompare(b.date) || byTitle(a, b);
    return b.date.localeCompare(a.date) || byTitle(a, b);
  });
}

/** One primary-topic group per document: no duplicated cards or inflated totals. */
export function groupDocuments(
  entries: readonly ContentSummary[],
): { topic: string; entries: ContentSummary[] }[] {
  const groups = new Map<string, ContentSummary[]>();
  for (const entry of entries) {
    const topic = entry.tags[0] || "其他文档";
    const group = groups.get(topic) ?? [];
    group.push(entry);
    groups.set(topic, group);
  }
  return Array.from(groups, ([topic, items]) => ({ topic, entries: items }));
}

/** Editorial order is used only when these actual public guides exist. */
export function quickStartDocuments(
  entries: readonly ContentSummary[],
): ContentSummary[] {
  const order = ["getting-started", "publishing-content", "media-guidelines"];
  return order.flatMap((slug) => {
    const entry = entries.find(
      (candidate) => candidate.kind === "docs" && candidate.slug === slug,
    );
    return entry ? [entry] : [];
  });
}

/** Keep unrelated query parameters when a shareable topic is changed. */
export function collectionTopicHref(
  kind: ContentKind,
  currentSearch: string,
  tag: string,
): string {
  const params = new URLSearchParams(currentSearch);
  if (tag === ALL_TOPICS) params.delete("tag");
  else params.set("tag", tag);
  const search = params.toString();
  return `/${kind}/${search ? `?${search}` : ""}`;
}
