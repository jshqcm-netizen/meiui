"use client";
import { ThemeProvider as Provider } from "next-themes";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      attribute="data-theme"
      defaultTheme="light"
      themes={["light", "dark"]}
      enableSystem={false}
      storageKey="qcm-appearance"
      disableTransitionOnChange
    >
      {children}
    </Provider>
  );
}
