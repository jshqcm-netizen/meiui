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

function rgb(color: string): number[] {
  if (color.startsWith("#")) return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return color.match(/[\d.]+/g)!.map(Number);
}
function mix(foreground: number[], background: number[], alpha = foreground[3] ?? 1) {
  return background.slice(0, 3).map((value, i) => foreground[i] * alpha + value * (1 - alpha));
}
function rgbContrast(a: number[], b: number[]) {
  const luminance = (channels: number[]) => channels.map((v) => v / 255)
    .map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + .05) / (low + .05);
}
for (const theme of ["light", "dark"]) {
  test(`${theme} glass text remains readable over bounded black and white backdrop extremes`, () => {
    const source = css.match(new RegExp(`\\[data-theme="${theme}"\\] \\{([\\s\\S]*?)\\}`))![1];
    const token = (name: string) => source.match(new RegExp(`--${name}:\\s*([^;]+);`))![1];
    const ratios: number[] = [];
    for (const pixel of [0, 255]) {
      const scene = mix([pixel, pixel, pixel], rgb(token("background")), Number(token("scene-opacity")));
      for (const shade of [false, true]) {
        const backdrop = shade ? mix(rgb(token("scene-shade")), scene) : scene;
        const workspace = mix(rgb(token("workspace-surface")), backdrop);
        const surfaces = [workspace, ...["sidebar-surface", "topbar-surface", "panel", "reading-surface"].map((name) => mix(rgb(token(name)), workspace))];
        for (const surface of surfaces) {
          for (const ink of ["foreground", "muted", "primary"]) {
            const ratio = rgbContrast(rgb(token(ink)), surface);
            ratios.push(ratio);
            assert.ok(ratio >= 4.5, `${theme} ${ink} alpha-bound contrast ${ratio}`);
          }
        }
      }
    }
    console.log(theme, "minimum bounded glass contrast", Math.min(...ratios).toFixed(2) + ":1");
  });
}
test("inactive tabs, selected text and luminous hero retain explicit contrasting ink", () => {
  assert.match(css, /\[data-slot="tabs-trigger"\]\s*\{\s*color:\s*var\(--muted\)/);
  assert.match(css, /::selection\s*\{\s*background:\s*var\(--surface-selected\);\s*color:\s*var\(--foreground\)/);
  const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{6});`))![1];
  assert.ok(contrast(token("hero-ink"), token("hero-surface")) >= 4.5);
  assert.ok(contrast(token("hero-muted"), token("hero-surface")) >= 4.5);
});
