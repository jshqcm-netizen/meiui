import test from "node:test";
import assert from "node:assert/strict";
import { withBasePath, prefixContentHtml } from "../lib/paths";

test("deployment paths prefix local targets exactly once", () => {
  for (const path of ["/", "/blog/?tag=AI", "/media/sample.mp4", "/icon.svg"]) {
    assert.equal(withBasePath(path, "/meiui"), `/meiui${path}`);
    assert.equal(withBasePath(`/meiui${path}`, "/meiui"), `/meiui${path}`);
    assert.equal(withBasePath(path, ""), path);
  }
  for (const path of ["#section-one", "https://example.com/", "//example.com/a", "mailto:a@example.com"]) {
    assert.equal(withBasePath(path, "/meiui"), path);
  }
});
test("sanitized Markdown media and links respect project base path", () => {
  const html = '<a href="/docs/start/#section-one">Read</a><img src="/media/a.webp"><a href="#section-one">Anchor</a><a href="https://example.com/">External</a>';
  const result = prefixContentHtml(html, "/meiui");
  assert.ok(result.includes('href="/meiui/docs/start/#section-one"'));
  assert.ok(result.includes('src="/meiui/media/a.webp"'));
  assert.ok(result.includes('href="#section-one"'));
  assert.ok(result.includes('href="https://example.com/"'));
  assert.equal(prefixContentHtml(result, "/meiui"), result);
});
