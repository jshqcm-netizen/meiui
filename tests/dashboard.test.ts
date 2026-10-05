import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboard, topicShortcuts } from "../lib/dashboard";
import type { ContentEntry } from "../lib/content-types";

const entry = (overrides: Partial<ContentEntry> = {}): ContentEntry => ({
  slug: "example", kind: "blog", title: "Example", description: "A public example entry",
  date: "2026-10-05", tags: ["AI"], status: "published", sample: true,
  readingMinutes: 2, body: "Body", html: "<p>Body</p>", headings: [], ...overrides,
});

test("workspace totals, featured content and topics exclude drafts and review content", () => {
  const result = buildDashboard([
    entry({ slug: "draft", status: "draft", featured: true, tags: ["Secret"] }),
    entry({ slug: "review", status: "review", kind: "docs", tags: ["Review"] }),
    entry({ slug: "public", sample: false }),
    entry({ slug: "guide", kind: "docs" }),
  ]);
  assert.equal(result.posts.length, 1);
  assert.equal(result.docs.length, 1);
  assert.equal(result.sampleCount, 1);
  assert.equal(result.featured?.slug, "public");
  assert.deepEqual(result.topics.map((topic) => topic.tag), ["AI", "AI"]);
  assert.ok(!("body" in result.posts[0]));
  assert.ok(!("html" in result.docs[0]));
});

test("featured choice prefers a published marked post and falls back to the newest post", () => {
  const input = [entry({ slug: "older", date: "2026-10-01", featured: true }), entry({ slug: "newer" })];
  assert.equal(buildDashboard(input).featured?.slug, "older");
  assert.equal(buildDashboard(input.map((item) => ({ ...item, featured: false }))).featured?.slug, "newer");
  assert.equal(input[0].slug, "older");
  assert.equal(buildDashboard([entry({ kind: "docs" })]).featured, undefined);
});

test("each topic link has counts matching its own destination collection", () => {
  const result = topicShortcuts([
    entry({ slug: "one", tags: ["AI & 安全", "AI & 安全"] }),
    entry({ slug: "two", tags: ["建站", "AI & 安全"] }),
    entry({ slug: "guide", kind: "docs", tags: ["AI & 安全"] }),
  ]);
  assert.deepEqual(result.map((topic) => [topic.tag, topic.kind, topic.count]), [
    ["AI & 安全", "blog", 2], ["建站", "blog", 1], ["AI & 安全", "docs", 1],
  ]);
  for (const topic of result) {
    const url = new URL(topic.href, "https://qcm.dev");
    assert.equal(url.pathname, `/${topic.kind}/`);
    assert.equal(url.searchParams.get("tag"), topic.tag);
  }
});

test("topic dock is bounded, deduplicated, and handles an empty library", () => {
  const entries = [entry(), entry({ slug: "second" }), entry({ slug: "third", tags: ["工具"] })];
  assert.equal(topicShortcuts(entries).length, 2);
  assert.equal(topicShortcuts(entries, 1).length, 1);
  assert.deepEqual(topicShortcuts(entries, 0), []);
  assert.deepEqual(topicShortcuts(entries, -1), []);
  assert.deepEqual(buildDashboard([]), { posts: [], docs: [], featured: undefined, sampleCount: 0, topics: [] });
});
