"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  FileText,
  Grid2X2,
  Home,
  Menu,
  Code2,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SiteSearch } from "@/components/site-search";
import type { SearchItem } from "@/lib/search";
export type { SearchItem } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/utils";
const icons = { home: Home, book: BookOpen, files: FileText, grid: Grid2X2 };
function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="qcm.dev 首页"
      onClick={onNavigate}
    >
      <span className="brand-mark" aria-hidden="true">
        q
      </span>
      <span>
        qcm<span className="brand-suffix">.dev</span>
      </span>
    </Link>
  );
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="主导航" className="primary-nav">
      {navItems.map((item) => {
        const Icon = icons[item.icon];
        const active =
          item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link
            onClick={onNavigate}
            key={item.href}
            href={item.href}
            className={cn("nav-link", active && "active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} strokeWidth={1.7} />
            <span>{item.label}</span>
            {active && <span className="nav-active-marker" />}
          </Link>
        );
      })}
    </nav>
  );
}
export function SiteShell({
  children,
  searchItems,
}: {
  children: React.ReactNode;
  searchItems: SearchItem[];
}) {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const current =
    navItems.find((n) => n.href !== "/" && path.startsWith(n.href))?.label ??
    "总览";
  return (
    <div className="workspace">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          个人空间 <span>Workspace</span>
        </div>
        <Navigation />
        <div className="sidebar-topics">
          <p>探索主题</p>
          <Link href="/blog/?tag=AI">
            <span className="topic-dot blue" />
            AI 与智能体
          </Link>
          <Link href="/blog/?tag=建站">
            <span className="topic-dot peach" />
            开发与工程
          </Link>
          <Link href="/docs/">
            <span className="topic-dot green" />
            方法与文档
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="build-note">
            <Code2 size={22} />
            <p>
              保持好奇，持续构建<span>A space for things in progress.</span>
            </p>
          </div>
          <Link href="/docs/getting-started/" className="sidebar-guide">
            <CircleHelp size={17} />
            从这里开始
          </Link>
          <div className="identity">
            <span className="avatar">Q</span>
            <div>
              qcm.dev<span>开放阅读 · 本地预览</span>
            </div>
            <span className="identity-spark">
              <Sparkles size={16} />
            </span>
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            <Sheet open={mobile} onOpenChange={setMobile}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu"
                  aria-label="打开导航"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="mobile-nav-sheet"
                showCloseButton={false}
              >
                <SheetHeader>
                  <div className="mobile-nav-top">
                    <Brand onNavigate={() => setMobile(false)} />
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="关闭导航">
                        ×
                      </Button>
                    </SheetClose>
                  </div>
                  <SheetTitle className="sr-only">qcm.dev 导航</SheetTitle>
                  <SheetDescription>
                    从一个想法，走向下一次构建
                  </SheetDescription>
                </SheetHeader>
                <Navigation onNavigate={() => setMobile(false)} />
                <Separator />
                <Link
                  className="mobile-guide-link"
                  href="/docs/getting-started/"
                  onClick={() => setMobile(false)}
                >
                  <CircleHelp size={18} />
                  从这里开始
                </Link>
                <p className="mobile-nav-foot">
                  技术手记 · 知识文档 · 应用空间
                </p>
              </SheetContent>
            </Sheet>
            <span className="breadcrumb-home">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span>{current}</span>
          </div>
          <div className="topbar-actions">
            <SiteSearch items={searchItems} />
            <Separator orientation="vertical" className="topbar-divider" />
            <span className="topbar-caption">Build something meaningful.</span>
            <span className="top-avatar" aria-hidden="true">
              Q
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="site-footer">
          <span>© 2026 qcm.dev</span>
          <span>记录探索，分享所知</span>
          <span className="footer-version">Preview v{site.version}</span>
        </footer>
      </div>
    </div>
  );
}
