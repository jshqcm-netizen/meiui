import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";

test("single-choice controls expose the actual radio semantics used by browser checks", () => {
  const html = renderToStaticMarkup(createElement(ToggleGroup, { type: "single", value: "light", "aria-label": "外观主题" },
    createElement(ToggleGroupItem, { value: "light", "aria-label": "浅色主题" }, "浅色"),
    createElement(ToggleGroupItem, { value: "dark", "aria-label": "深色主题" }, "深色"),
  ));
  assert.equal((html.match(/role="radio"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-checked="false"/g) ?? []).length, 1);
  assert.match(html, /aria-label="浅色主题"/);
  assert.match(html, /aria-label="深色主题"/);
});
