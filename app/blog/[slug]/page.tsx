import { notFound } from "next/navigation";
import { getAllContent, getContent } from "@/lib/content";
import { Article } from "@/components/article";
export async function generateStaticParams() {
  return (await getAllContent("blog")).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await getContent("blog", slug);
  return { title: e?.title ?? "未找到手记", description: e?.description };
}
export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getContent("blog", slug);
  if (!entry) notFound();
  return (
    <Article
      entry={entry}
      related={(await getAllContent("blog")).filter((p) => p.slug !== slug)}
    />
  );
}
