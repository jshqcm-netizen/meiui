/** Kept in sync with glass-theme.css by tests/theme.test.ts. No user data leaves the browser. */
export const themePalettes = {
  light: {
    surface: "#f2f7fd",
    raised: "#e1eaf6",
    selected: "#dce8f8",
    foreground: "#26354a",
    muted: "#43546b",
    primary: "#31599f",
    blue: "#e2edfb",
    peach: "#f1e3d8",
    green: "#dfede5",
  },
  dark: {
    surface: "#26354b",
    raised: "#2d3e56",
    selected: "#344966",
    foreground: "#ecf2fc",
    muted: "#c1cde0",
    primary: "#b9d0ff",
    blue: "#2b3e5a",
    peach: "#453b3f",
    green: "#294441",
  },
} as const;
export type SiteTheme = keyof typeof themePalettes;
