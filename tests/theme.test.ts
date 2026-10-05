import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
// WCAG 2 relative luminance. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
function luminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
test("app metadata meets normal-text contrast in the fixed light palette, including full glow colors", () => {
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const component = readFileSync(
    new URL("../components/app-glass.tsx", import.meta.url),
    "utf8",
  );
  const foreground = css.match(/--muted:\s*(#[\da-f]{6})/i)?.[1];
  assert.ok(foreground);
  const surfaces = [
    ...css.matchAll(
      /\.app-card(?:\[data-tone="(?:peach|green)"\])?\s*\{[^}]*?--background:\s*(#[\da-f]{6})/gi,
    ),
  ].map((match) => match[1]);
  const glows = [...component.matchAll(/glow:\s*"(#[\da-f]{6})"/gi)].map(
    (match) => match[1],
  );
  assert.equal(surfaces.length, 3);
  assert.equal(glows.length, 3);
  for (const background of [...surfaces, ...glows]) {
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= 4.5, `${foreground} on ${background} is ${ratio}:1`);
  }
  for (const selector of [
    '.app-glass [data-slot="card-description"]',
    ".app-glass .app-domain",
    ".app-open-label",
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rules = [
      ...css.matchAll(new RegExp(escaped + "\\s*\\{([^}]*)\\}", "g")),
    ].map((match) => match[1]);
    assert.ok(
      rules.some((rule) => rule.includes("color: var(--muted);")),
      selector,
    );
    assert.ok(
      rules.every(
        (rule) =>
          !rule.includes("color:") || rule.includes("color: var(--muted);"),
      ),
      selector,
    );
  }
  // No dark theme exists in this edition: native controls keep the same intended palette under either OS preference.
  assert.match(css, /:root\s*\{[^}]*color-scheme:\s*light;/);
  assert.ok(!css.includes("prefers-color-scheme: dark"));
  console.log(
    "Card text contrast:",
    [...surfaces, ...glows]
      .map(
        (background) =>
          `${background} ${contrast(foreground, background).toFixed(2)}:1`,
      )
      .join(", "),
  );
});
