import Link from "next/link";
import { notFound } from "next/navigation";
import { apps } from "@/lib/site";
import { ChevronLeft, Sparkles, Workflow, PanelsTopLeft, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppPlanDetails } from "@/components/app-workspace";
import styles from "@/components/app-workspace.module.css";

const appIcons = { sparkles: Sparkles, workflow: Workflow, panels: PanelsTopLeft };
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
  const Icon = appIcons[app.icon];
  return (
    <div className="page app-detail-page">
      <Link href="/apps/" className="back-link">
        <ChevronLeft size={16} />
        所有应用
      </Link>
      <div className={styles.detailLayout}>
        <section className={styles.detailSummary} aria-labelledby="app-name">
          <div className={`app-icon ${app.accent}`} aria-hidden="true">
            <Icon />
          </div>
          <Badge variant="outline">规划中，尚未部署</Badge>
          <h1 id="app-name">{app.name}</h1>
          <h2>{app.title}</h2>
          <p>{app.description}</p>
          <div className={styles.reservedDomain}>
            <Globe2 size={18} aria-hidden="true" />
            <div>
              <strong>{app.domain}</strong>
              <span>预留地址 · 尚未连接</span>
            </div>
          </div>
        </section>
        <AppPlanDetails app={app} />
      </div>
    </div>
  );
}
