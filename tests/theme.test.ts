import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { themePalettes } from "../lib/theme";
function luminance(hex: string): number {
  const values = [1, 3, 5]
    .map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}
const css = readFileSync(
  new URL("../app/glass-theme.css", import.meta.url),
  "utf8",
);
for (const [name, palette] of Object.entries(themePalettes)) {
  test(`${name} theme preserves normal-text contrast across actual solid surfaces`, () => {
    const surfaces = [
      palette.surface,
      palette.raised,
      palette.selected,
      palette.blue,
      palette.peach,
      palette.green,
    ];
    const ratios = surfaces.map((background) =>
      contrast(palette.muted, background),
    );
    assert.ok(
      ratios.every((value) => value >= 4.5),
      `${name} muted contrast: ${ratios}`,
    );
    assert.ok(
      surfaces.every(
        (background) => contrast(palette.foreground, background) >= 4.5,
      ),
    );
    assert.ok(
      surfaces.every(
        (background) => contrast(palette.primary, background) >= 4.5,
      ),
    );
    for (const value of Object.values(palette))
      assert.ok(css.includes(value), `Missing actual CSS token ${value}`);
    console.log(
      name,
      "minimum muted contrast",
      Math.min(...ratios).toFixed(2) + ":1",
    );
  });
}
test("theme behavior is explicit and decorative glass cannot become interactive content", () => {
  const provider = readFileSync(
    new URL("../components/theme-provider.tsx", import.meta.url),
    "utf8",
  );
  const switcher = readFileSync(
    new URL("../components/theme-switch.tsx", import.meta.url),
    "utf8",
  );
  const glass = readFileSync(
    new URL("../components/app-glass.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(provider.includes("data-theme"));
  assert.ok(provider.includes("qcm-appearance"));
  assert.ok(provider.includes("enableSystem={false}"));
  assert.ok(switcher.includes("浅色主题") && switcher.includes("深色主题"));
  assert.ok(
    css.includes("color-scheme:dark") || css.includes("color-scheme: dark"),
  );
  assert.ok(
    css.includes("pointer-events:none") || css.includes("pointer-events: none"),
  );
  assert.ok(
    glass.includes("useReducedMotion") &&
      glass.includes("var(--highlight-blue)"),
  );
  assert.ok(css.includes("@supports not (backdrop-filter"));
});
