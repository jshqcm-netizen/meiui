import { withBasePath } from "@/lib/paths";
import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./glass-theme.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteShell, type SearchItem } from "@/components/site-shell";
import { getSearchIndex } from "@/lib/content";
import { site, apps } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(site.baseUrl),
  title: { default: "qcm.dev · 探索，构建，分享", template: "%s · qcm.dev" },
  description: site.description,
  robots: { index: false, follow: false },
  icons: { icon: withBasePath("/icon.svg") },
  openGraph: {
    title: "qcm.dev",
    description: site.description,
    type: "website",
    locale: "zh_CN",
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSearchIndex();
  const searchItems: SearchItem[] = [
    ...content,
    ...apps.map((a) => ({
      title: a.name,
      description: a.description,
      tags: [a.category, "规划中"],
      kind: "app",
      href: `/apps/${a.slug}/`,
    })),
  ];
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body style={{ "--cobalt-backdrop": `url("${withBasePath("/media/cobalt-glass.webp")}")`, "--studio-backdrop": `url("${withBasePath("/media/frosted-studio.webp")}")` } as React.CSSProperties}>
        <ThemeProvider>
          <SiteShell searchItems={searchItems}>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
