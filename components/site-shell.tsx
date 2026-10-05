"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Command,
  FileText,
  Grid2X2,
  Home,
  Menu,
  Search,
  Code2,
  Sparkles,
  X,
  CircleHelp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";
export type SearchItem = {
  title: string;
  description: string;
  href: string;
  tags: string[];
  kind: string;
  text?: string;
};
const icons = { home: Home, book: BookOpen, files: FileText, grid: Grid2X2 };
function Brand() {
  return (
    <Link href="/" className="brand" aria-label="qcm.dev 首页">
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
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((x) => !x);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const current =
    navItems.find((n) => n.href !== "/" && path.startsWith(n.href))?.label ??
    "总览";
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = searchItems
    .filter((item) =>
      terms.every((term) =>
        `${item.title} ${item.description} ${item.tags.join(" ")} ${item.text ?? ""}`
          .toLocaleLowerCase()
          .includes(term),
      ),
    )
    .slice(0, 8);
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
          <Link href="/blog/?tag=工程">
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
            <Dialog open={mobile} onOpenChange={setMobile}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu"
                  aria-label="打开导航"
                >
                  <Menu />
                </Button>
              </DialogTrigger>
              <DialogContent className="mobile-nav-dialog">
                <DialogHeader>
                  <DialogTitle>qcm.dev 导航</DialogTitle>
                  <DialogDescription>
                    探索技术手记、文档与应用
                  </DialogDescription>
                </DialogHeader>
                <Navigation onNavigate={() => setMobile(false)} />
              </DialogContent>
            </Dialog>
            <span className="breadcrumb-home">Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span>{current}</span>
          </div>
          <div className="topbar-actions">
            <Dialog
              open={open}
              onOpenChange={(value) => {
                setOpen(value);
                if (!value) setQuery("");
              }}
            >
              <DialogTrigger asChild>
                <button className="search-trigger">
                  <Search size={16} />
                  <span>搜索内容...</span>
                  <kbd>⌘ K</kbd>
                </button>
              </DialogTrigger>
              <DialogContent className="search-dialog" showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>搜索这个空间</DialogTitle>
                  <DialogDescription>
                    查找技术手记、知识文档和应用
                  </DialogDescription>
                </DialogHeader>
                <div className="search-input-wrap">
                  <Search size={19} />
                  <input
                    aria-label="搜索关键词"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="试试 Markdown、AI、工程…"
                  />
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" aria-label="关闭搜索">
                      <X />
                    </Button>
                  </DialogClose>
                </div>
                <div className="search-results" aria-live="polite">
                  <p className="search-hint">
                    {query ? `找到 ${results.length} 条结果` : "从这里开始"}
                  </p>
                  {results.map((item) => (
                    <Link
                      href={item.href}
                      key={item.href}
                      className="search-result"
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="search-result-icon">
                        {item.kind === "docs" ? (
                          <FileText />
                        ) : item.kind === "app" ? (
                          <Grid2X2 />
                        ) : (
                          <BookOpen />
                        )}
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                      <span className="search-kind">
                        {item.kind === "docs"
                          ? "文档"
                          : item.kind === "app"
                            ? "应用"
                            : "手记"}
                      </span>
                    </Link>
                  ))}
                  {results.length === 0 && (
                    <div className="search-empty">
                      <Search />
                      <strong>还没有相关内容</strong>
                      <span>换一个关键词，或尝试 “Markdown”</span>
                    </div>
                  )}
                </div>
                <div className="search-footer">
                  <span>
                    <Command size={13} /> K 打开搜索
                  </span>
                  <span>Esc 关闭</span>
                </div>
              </DialogContent>
            </Dialog>
            <span className="topbar-divider" />
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
          <span className="footer-version">Preview v0.1</span>
        </footer>
      </div>
    </div>
  );
}
