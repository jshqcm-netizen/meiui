"use client";
import { useRef, useEffect } from "react";
/** Clipboard work happens only after a reader explicitly clicks a code-copy button. */
export function ArticleBody({ html }: { html: string }) {
  const root = useRef<HTMLDivElement>(null);
  const announcement = useRef<HTMLParagraphElement>(null);
  const timers = useRef(
    new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>(),
  );
  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of active.values()) clearTimeout(timer);
      active.clear();
    };
  }, []);
  const copy = async (event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-copy-code]",
    );
    if (!button || !root.current?.contains(button)) return;
    const code = button.closest(".code-frame")?.querySelector("pre code");
    if (!code) return;
    const previous = timers.current.get(button);
    if (previous) clearTimeout(previous);
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code.textContent ?? "");
      button.textContent = "已复制";
      button.dataset.copyState = "copied";
      if (announcement.current)
        announcement.current.textContent = "代码已复制到剪贴板";
    } catch {
      button.textContent = "请手动选择";
      button.dataset.copyState = "failed";
      if (announcement.current)
        announcement.current.textContent =
          "浏览器未允许复制。请在代码区域手动选择并复制文本。";
    }
    timers.current.set(
      button,
      setTimeout(() => {
        if (button.isConnected) {
          button.textContent = "复制代码";
          delete button.dataset.copyState;
        }
        timers.current.delete(button);
      }, 2400),
    );
  };
  return (
    <>
      <div
        ref={root}
        className="prose"
        onClick={copy}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p
        ref={announcement}
        className="sr-only"
        role="status"
        aria-live="polite"
      />
    </>
  );
}
