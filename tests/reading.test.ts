import assert from "node:assert/strict";
import test from "node:test";
import { prepareReadingHtml } from "../lib/reading";
test("code reading controls keep escaped code intact and add focusable scroll regions", () => {
  const input =
    '<h2 id="section-test">标题</h2><pre><code class="language-ts">const a = &lt;string&gt;&quot;x&quot;\n</code></pre>';
  const html = prepareReadingHtml(input);
  assert.ok(
    html.includes(
      '<code class="language-ts">const a = &lt;string&gt;&quot;x&quot;\n</code>',
    ),
  );
  assert.ok(html.includes('tabindex="0" role="region"'));
  assert.ok(html.includes("TypeScript代码块"));
  assert.ok(html.includes('data-copy-code="1"'));
});
test("code controls preserve nested Markdown structure and deterministic unique IDs", () => {
  const html = prepareReadingHtml(
    "<blockquote><pre><code>a</code></pre></blockquote><pre><code>b</code></pre>",
  );
  assert.match(html, /<blockquote><div class="code-frame">/);
  assert.ok(html.includes('id="code-block-1"'));
  assert.ok(html.includes('id="code-block-2"'));
  assert.equal((html.match(/data-copy-code=/g) ?? []).length, 2);
});
test("plain prose is unchanged and unknown language names do not become HTML", () => {
  const plain = "<p>Safe <strong>Markdown</strong></p>";
  assert.equal(prepareReadingHtml(plain), plain);
  const html = prepareReadingHtml(
    '<pre><code class="language-unrecognized">&lt;script&gt;</code></pre>',
  );
  assert.ok(html.includes('class="code-language">代码</span>'));
  assert.ok(!html.includes("<script>"));
});
