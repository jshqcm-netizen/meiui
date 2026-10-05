import Link from "next/link";
import { Sparkles, Workflow, PanelsTopLeft, ChevronRight } from "lucide-react";
import { type AppEntry } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
const appIcons = {
  sparkles: Sparkles,
  workflow: Workflow,
  panels: PanelsTopLeft,
};
export function AppCard({ app }: { app: AppEntry }) {
  const Icon = appIcons[app.icon];
  return (
    <Link href={`/apps/${app.slug}/`} className={`app-card ${app.accent}`}>
      <div className="app-card-top">
        <span className={`app-icon ${app.accent}`}>
          <Icon size={23} strokeWidth={1.6} />
        </span>
        <Badge variant="outline">规划中</Badge>
      </div>
      <div className="app-title">
        <h3>{app.name}</h3>
        <ChevronRight size={18} />
      </div>
      <p>{app.description}</p>
      <div className="app-domain">
        {app.domain}
        <span>{app.category}</span>
      </div>
    </Link>
  );
}
