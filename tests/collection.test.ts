import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL_TOPICS,
  collectionTopicHref,
  collectionTopics,
  groupDocuments,
  quickStartDocuments,
  selectCollection,
  toContentSummary,
  type ContentSummary,
} from "../lib/collection";

const entries: ContentSummary[] = [
  {
    slug: "newest",
    kind: "blog",
    title: "AI 实践",
    description: "Review a local writing workflow",
    date: "2026-10-05",
    tags: ["AI", "工作流"],
    readingMinutes: 8,
    sample: true,
  },
  {
    slug: "oldest",
    kind: "blog",
    title: "本地工具",
    description: "Local-first tools and examples",
    date: "2026-09-01",
    tags: ["工具", "工作流"],
    readingMinutes: 2,
    sample: false,
  },
  {
    slug: "middle",
    kind: "blog",
    title: "安全检查",
    description: "Review a publishing workflow",
    date: "2026-10-01",
    tags: ["安全", "AI"],
    readingMinutes: 4,
    sample: true,
  },
];

test("collection topic counts reflect unique public entries and retain source order", () => {
  assert.deepEqual(collectionTopics(entries), [
    { tag: ALL_TOPICS, count: 3 },
    { tag: "AI", count: 2 },
    { tag: "工作流", count: 2 },
    { tag: "工具", count: 1 },
    { tag: "安全", count: 1 },
  ]);
  assert.deepEqual(collectionTopics([]), [{ tag: ALL_TOPICS, count: 0 }]);
  assert.equal(
    collectionTopics([{ ...entries[0], tags: ["AI", "AI"] }])[1].count,
    1,
  );
});

test("search matches title, description and tags with normalization and all terms", () => {
  assert.deepEqual(
    selectCollection(entries, { query: "  ＡＩ   review  " }).map(
      (entry) => entry.slug,
    ),
    ["newest", "middle"],
  );
  assert.deepEqual(
    selectCollection(entries, { query: "LOCAL 工具" }).map(
      (entry) => entry.slug,
    ),
    ["oldest"],
  );
  assert.equal(selectCollection(entries, { query: "missing" }).length, 0);
  assert.equal(selectCollection(entries, { query: "   " }).length, 3);
});

test("topic and search intersect; an unknown URL topic remains honestly empty", () => {
  assert.deepEqual(
    selectCollection(entries, { tag: "工作流", query: "AI" }).map(
      (entry) => entry.slug,
    ),
    ["newest"],
  );
  assert.equal(selectCollection(entries, { tag: "missing-topic" }).length, 0);
  assert.equal(selectCollection(entries, { tag: "AI" }).length, 2);
});

test("sort controls order the result without mutating the source collection", () => {
  const before = JSON.stringify(entries);
  assert.deepEqual(
    selectCollection(entries).map((entry) => entry.slug),
    ["newest", "middle", "oldest"],
  );
  assert.deepEqual(
    selectCollection(entries, { sort: "oldest" }).map((entry) => entry.slug),
    ["oldest", "middle", "newest"],
  );
  assert.deepEqual(
    selectCollection(entries, { sort: "shortest" }).map((entry) => entry.slug),
    ["oldest", "middle", "newest"],
  );
  const titleSorted = selectCollection(entries, { sort: "title" });
  assert.deepEqual(
    titleSorted.map((entry) => entry.title),
    [...entries]
      .sort((a, b) =>
        a.title.localeCompare(b.title, "zh-CN", { numeric: true }),
      )
      .map((entry) => entry.title),
  );
  assert.equal(JSON.stringify(entries), before);
});

test("sorting uses a deterministic title and slug tie-breaker", () => {
  const same = [
    { ...entries[0], slug: "b" },
    { ...entries[0], slug: "a" },
  ];
  for (const sort of ["newest", "oldest", "shortest", "title"] as const) {
    assert.deepEqual(
      selectCollection(same, { sort }).map((entry) => entry.slug),
      ["a", "b"],
    );
  }
});

test("document groups count each item once and preserve the sorted order", () => {
  const docs = entries.map((entry) => ({ ...entry, kind: "docs" as const }));
  docs[2].tags = ["AI", "安全"];
  const groups = groupDocuments(docs);
  assert.deepEqual(
    groups.map((group) => [group.topic, group.entries.length]),
    [
      ["AI", 2],
      ["工具", 1],
    ],
  );
  assert.deepEqual(
    groups.flatMap((group) => group.entries.map((entry) => entry.slug)),
    ["newest", "middle", "oldest"],
  );
  assert.deepEqual(groupDocuments([]), []);
});

test("quick-start links only use actual supplied documents in editorial order", () => {
  const docs = [
    "media-guidelines",
    "unrelated",
    "getting-started",
    "publishing-content",
  ].map((slug) => ({ ...entries[0], slug, kind: "docs" as const }));
  assert.deepEqual(
    quickStartDocuments(docs).map((entry) => entry.slug),
    ["getting-started", "publishing-content", "media-guidelines"],
  );
  assert.deepEqual(
    quickStartDocuments(docs.slice(0, 2)).map((entry) => entry.slug),
    ["media-guidelines"],
  );
  assert.deepEqual(
    quickStartDocuments([{ ...entries[0], slug: "getting-started" }]),
    [],
  );
  assert.deepEqual(quickStartDocuments([]), []);
});

test("topic URLs encode labels, remove all-topics filter and keep unrelated query state", () => {
  const href = collectionTopicHref(
    "blog",
    "tag=old&source=sidebar",
    "AI & 安全",
  );
  const url = new URL(href, "https://qcm.dev");
  assert.equal(url.pathname, "/blog/");
  assert.equal(url.searchParams.get("tag"), "AI & 安全");
  assert.equal(url.searchParams.get("source"), "sidebar");
  assert.equal(
    collectionTopicHref("docs", "tag=AI&source=sidebar", ALL_TOPICS),
    "/docs/?source=sidebar",
  );
  assert.equal(collectionTopicHref("blog", "tag=AI", ALL_TOPICS), "/blog/");
});

test("serialization only copies display metadata and does not leak full content", () => {
  const input = {
    ...entries[0],
    body: "private body",
    html: "private html",
    status: "published",
    headings: ["heading"],
  };
  const result = toContentSummary(input);
  assert.deepEqual(Object.keys(result).sort(), [
    "date",
    "description",
    "kind",
    "readingMinutes",
    "sample",
    "slug",
    "tags",
    "title",
  ]);
  assert.equal(result.sample, true);
  assert.notEqual(result.tags, input.tags);
  assert.deepEqual(result, entries[0]);
});
