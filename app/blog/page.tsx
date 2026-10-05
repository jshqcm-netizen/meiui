import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllContent } from "@/lib/content";
import { toContentSummary } from "@/lib/collection";
import { ContentList } from "@/components/content-list";
import { CollectionFallback } from "@/components/collection-cards";
import { CollectionOverview } from "@/components/collection-overview";
export const metadata: Metadata = { title: "技术手记" };
export default async function Blog() {
  const entries = (await getAllContent("blog")).map(toContentSummary);
  const sampleCount = entries.filter((entry) => entry.sample).length;
  return (
    <div className="page collection-page">
      <div className="page-heading">
        <div>
          <div className="greeting">The notebook</div>
          <h1>技术手记</h1>
          <p>把实践写下来，把问题想明白。关于 AI、工程与持续创造。</p>
        </div>
        <span className="edition-pill">
          {entries.length} 篇手记
          {sampleCount > 0 ? ` · ${sampleCount} 篇示例` : ""}
        </span>
      </div>
      <CollectionOverview entries={entries} kind="blog" />
      <Suspense fallback={<CollectionFallback entries={entries} kind="blog" />}>
        <ContentList entries={entries} kind="blog" />
      </Suspense>
    </div>
  );
}
