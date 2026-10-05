import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { toContentSummary } from "@/lib/collection";
import { ContentList } from "@/components/content-list";
import { CollectionFallback } from "@/components/collection-cards";
import { CollectionOverview } from "@/components/collection-overview";
export const metadata: Metadata = { title: "知识文档" };
export default async function Docs() {
  const entries = (await getAllContent("docs")).map(toContentSummary);
  const sampleCount = entries.filter((entry) => entry.sample).length;
  return (
    <div className="page collection-page">
      <div className="page-heading">
        <div>
          <div className="greeting">The knowledge base</div>
          <h1>知识文档</h1>
          <p>可以一步步跟着做，也可以随时回来看。</p>
        </div>
        <span className="edition-pill">
          {entries.length} 份文档
          {sampleCount > 0 ? ` · ${sampleCount} 份示例` : ""}
        </span>
      </div>
      <CollectionOverview entries={entries} kind="docs" />
      <Suspense fallback={<CollectionFallback entries={entries} kind="docs" />}>
        <ContentList entries={entries} kind="docs" />
      </Suspense>
    </div>
  );
}
