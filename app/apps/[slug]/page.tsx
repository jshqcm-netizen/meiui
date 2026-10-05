import Link from "next/link";
import { notFound } from "next/navigation";
import { apps } from "@/lib/site";
import { ChevronLeft, Sparkles, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: apps.find((a) => a.slug === slug)?.name ?? "应用" };
}
export default async function AppDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = apps.find((a) => a.slug === slug);
  if (!app) notFound();
  return (
    <div className="page app-detail-page">
      <Link href="/apps/" className="back-link">
        <ChevronLeft size={16} />
        所有应用
      </Link>
      <section className={`app-detail glass-panel ${app.accent}`}>
        <div className={`app-icon ${app.accent}`}>
          <Sparkles />
        </div>
        <Badge variant="outline">规划中，尚未部署</Badge>
        <h1>{app.name}</h1>
        <h2>{app.title}</h2>
        <p>{app.description}</p>
        <div className="reserved-domain">
          <Code2 size={18} />
          <span>{app.domain}</span>
          <small>预留地址</small>
        </div>
        <ul>
          {app.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <Link href="/docs/getting-started/" className="text-link">
          了解主站结构
        </Link>
      </section>
    </div>
  );
}
