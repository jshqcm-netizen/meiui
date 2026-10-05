import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { ContentList } from "@/components/content-list";
export const metadata: Metadata = { title: "技术手记" };
export default async function Blog() {
  const entries = await getAllContent("blog");
  return (
    <div className="page collection-page">
      <div className="page-heading">
        <div>
          <div className="greeting">The notebook</div>
          <h1>技术手记</h1>
          <p>把实践写下来，把问题想明白。关于 AI、工程与持续创造。</p>
        </div>
        <span className="edition-pill">{entries.length} 篇示例手记</span>
      </div>
      <Suspense fallback={<p>正在整理内容…</p>}>
        <ContentList
          entries={entries.map(
            ({
              slug,
              kind,
              title,
              description,
              date,
              tags,
              readingMinutes,
              sample,
            }) => ({
              slug,
              kind,
              title,
              description,
              date,
              tags,
              readingMinutes,
              sample,
            }),
          )}
          kind="blog"
        />
      </Suspense>
    </div>
  );
}
