import { notFound } from "next/navigation";
import { getAllContent, getContent } from "@/lib/content";
import { Article } from "@/components/article";
export async function generateStaticParams() {
  return (await getAllContent("docs")).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await getContent("docs", slug);
  return { title: e?.title ?? "未找到文档", description: e?.description };
}
export default async function Doc({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getContent("docs", slug);
  if (!entry) notFound();
  return (
    <Article
      entry={entry}
      related={(await getAllContent("docs")).filter((p) => p.slug !== slug)}
    />
  );
}
