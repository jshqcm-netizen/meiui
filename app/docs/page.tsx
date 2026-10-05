import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { ContentList } from "@/components/content-list";
import { BookOpenCheck } from "lucide-react";
export const metadata: Metadata = { title: "知识文档" };
export default async function Docs() {
  const entries = await getAllContent("docs");
  return (
    <div className="page collection-page">
      <div className="page-heading">
        <div>
          <div className="greeting">The knowledge base</div>
          <h1>知识文档</h1>
          <p>可以一步步跟着做，也可以随时回来看。</p>
        </div>
        <span className="edition-pill">{entries.length} 份入门文档</span>
      </div>
      <div className="docs-intro">
        <BookOpenCheck size={28} />
        <div>
          <h2>从这份站点开始</h2>
          <p>
            了解目录结构、内容审核和媒体规范。这些文档也可以直接替换成你自己的知识库。
          </p>
        </div>
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
          kind="docs"
        />
      </Suspense>
    </div>
  );
}
