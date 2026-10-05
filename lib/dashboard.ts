import type { ContentEntry, ContentKind } from "./content-types";
import { collectionTopicHref, toContentSummary, type ContentSummary } from "./collection";

export type TopicShortcut = {
  tag: string;
  kind: ContentKind;
  count: number;
  href: string;
};

/** The home workspace uses only published metadata, never draft bodies or totals. */
export function buildDashboard(entries: readonly ContentEntry[]) {
  const published = entries
    .filter((entry) => entry.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const posts = published.filter((entry) => entry.kind === "blog");
  const docs = published.filter((entry) => entry.kind === "docs");
  const featured = posts.find((entry) => entry.featured) ?? posts[0];
  return {
    posts: posts.map(toContentSummary),
    docs: docs.map(toContentSummary),
    featured: featured ? toContentSummary(featured) : undefined,
    sampleCount: published.filter((entry) => entry.sample).length,
    topics: topicShortcuts([...posts, ...docs].map(toContentSummary)),
  };
}

/** Each shortcut counts only the collection it opens, with primary topics first. */
export function topicShortcuts(entries: readonly ContentSummary[], limit = 4): TopicShortcut[] {
  const result: TopicShortcut[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (result.length >= Math.max(0, limit)) break;
    const tag = entry.tags[0];
    const key = `${entry.kind}:${tag}`;
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    result.push({
      tag,
      kind: entry.kind,
      count: entries.filter((candidate) => candidate.kind === entry.kind && candidate.tags.includes(tag)).length,
      href: collectionTopicHref(entry.kind, "", tag),
    });
  }
  return result;
}
