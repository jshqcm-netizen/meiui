import { ListTree, ChevronDown } from "lucide-react";
import type { ContentHeading } from "@/lib/content-types";
export function TableOfContents({ headings }: { headings: ContentHeading[] }) {
  if (!headings.length) return null;
  return (
    <details className="toc article-toc" open>
      <summary>
        <ListTree size={17} aria-hidden="true" />
        <span>本文目录</span>
        <small>{headings.length}</small>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <nav aria-label="本文目录">
        <ul>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level > 2 ? "toc-child" : ""}
            >
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
