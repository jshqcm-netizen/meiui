import assert from "node:assert/strict";
import test from "node:test";
import { searchContent, type SearchItem } from "../lib/search";
const items: SearchItem[] = [
  {
    title: "Markdown 入门",
    description: "内容安全与工程",
    href: "/docs/markdown/",
    tags: ["工程"],
    kind: "docs",
    text: "AI 工作流",
  },
  {
    title: "AI 工作流",
    description: "从草稿到审核",
    href: "/blog/ai/",
    tags: ["AI"],
    kind: "blog",
  },
  {
    title: "开发记录",
    description: "AI 与工程笔记",
    href: "/blog/dev/",
    tags: ["AI"],
    kind: "blog",
  },
];
test("search normalizes full-width Latin text and ranks title matches before body matches", () => {
  assert.deepEqual(
    searchContent(items, "ＡＩ").map((item) => item.href),
    ["/blog/ai/", "/blog/dev/", "/docs/markdown/"],
  );
});
test("search requires every term and supports Chinese plus Latin queries", () => {
  assert.deepEqual(
    searchContent(items, "ai 工程").map((item) => item.href),
    ["/blog/dev/", "/docs/markdown/"],
  );
  assert.deepEqual(searchContent(items, "absent"), []);
});
test("empty search preserves entry order without mutating the index", () => {
  const before = JSON.stringify(items);
  assert.deepEqual(searchContent(items, "   "), items);
  searchContent(items, "AI");
  assert.equal(JSON.stringify(items), before);
});
