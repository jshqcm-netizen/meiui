"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Grid2X2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { searchContent, type SearchItem } from "@/lib/search";
const groups = [
  { kind: "blog", label: "技术手记", Icon: BookOpen },
  { kind: "docs", label: "知识文档", Icon: FileText },
  { kind: "app", label: "应用规划", Icon: Grid2X2 },
];
export function SiteSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const changeOpen = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  }, []);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        changeOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, changeOpen]);
  const results = searchContent(items, query);
  const navigate = (href: string) => {
    changeOpen(false);
    router.push(href);
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button
          className="search-trigger"
          aria-label="搜索内容"
          aria-keyshortcuts="Control+k Meta+k"
        >
          <Search size={17} aria-hidden="true" />
          <span>搜索这个空间</span>
          <kbd aria-hidden="true">⌘ K</kbd>
        </button>
      </DialogTrigger>
      <DialogContent
        className="search-dialog command-dialog"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="search-title-row">
            <DialogTitle>搜索这个空间</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="关闭搜索">
                <X />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            用关键词寻找笔记、文档和应用规划
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} loop>
          <CommandInput
            aria-label="搜索关键词"
            value={query}
            onValueChange={setQuery}
            placeholder="搜索 Markdown、AI、工程…"
            maxLength={160}
            onKeyDownCapture={(event) => {
              if (
                event.key === "Enter" &&
                (event.nativeEvent.isComposing ||
                  event.nativeEvent.keyCode === 229)
              ) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
          />
          <p className="search-hint" role="status">
            {query ? `${results.length} 条相关内容` : "浏览这个空间"}
          </p>
          <CommandList aria-label="搜索结果">
            <CommandEmpty>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>还没有相关内容</EmptyTitle>
                  <EmptyDescription>
                    换一个关键词，或尝试 “Markdown”
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CommandEmpty>
            {groups.map(({ kind, label, Icon }) => {
              const entries = results.filter((item) => item.kind === kind);
              if (!entries.length) return null;
              return (
                <CommandGroup key={kind} heading={label}>
                  {entries.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={item.href}
                      onSelect={navigate}
                    >
                      <span className="search-result-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="command-result-copy">
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                      <span className="command-result-kind">
                        {item.sample ? "示例" : kind === "app" ? "规划中" : ""}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
        <div className="search-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>选择 <kbd>↵</kbd>打开
          </span>
          <span>
            <kbd>Esc</kbd>关闭
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
