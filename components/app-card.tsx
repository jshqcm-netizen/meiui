import Link from "next/link";
import { Sparkles, Workflow, PanelsTopLeft } from "lucide-react";
import { type AppEntry } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AppGlass } from "@/components/app-glass";
const appIcons = {
  sparkles: Sparkles,
  workflow: Workflow,
  panels: PanelsTopLeft,
};
export function AppCard({ app }: { app: AppEntry }) {
  const Icon = appIcons[app.icon];
  return (
    <Link
      href={`/apps/${app.slug}/`}
      className="app-card"
      data-tone={app.accent}
      aria-label={`${app.name}，${app.title}，查看规划`}
    >
      <AppGlass tone={app.accent}>
        <Card className="h-full">
          <CardHeader>
            <div className="app-card-top">
              <span className={`app-icon ${app.accent}`} aria-hidden="true">
                <Icon size={25} strokeWidth={1.6} />
              </span>
              <Badge variant="outline">规划中</Badge>
            </div>
            <CardTitle>
              <h3>{app.name}</h3>
            </CardTitle>
            <CardDescription>{app.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{app.description}</p>
          </CardContent>
          <CardFooter>
            <span className="app-domain">{app.domain}</span>
            <span className="app-open-label">查看规划</span>
          </CardFooter>
        </Card>
      </AppGlass>
    </Link>
  );
}
