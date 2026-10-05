import type { Metadata } from "next";
import { apps } from "@/lib/site";
import { AppCard } from "@/components/app-card";
import { AppDomainMap, AppPlanningFaq } from "@/components/app-workspace";
import styles from "@/components/app-workspace.module.css";
export const metadata: Metadata = { title: "应用空间" };
export default function Apps() {
  return (
    <div className="page collection-page">
      <div className="page-heading">
        <div>
          <div className="greeting">Made for exploration</div>
          <h1>应用空间</h1>
          <p>主站是起点。每个子应用，都可以长出自己的可能。</p>
        </div>
        <span className="edition-pill">{apps.length} 个规划入口</span>
      </div>
      <div className={styles.workspacePanels}>
        <AppDomainMap />
        <AppPlanningFaq />
      </div>
      <section aria-labelledby="app-plans-title">
        <div className={styles.appsHeading}>
          <div>
            <h2 id="app-plans-title">找到想继续的方向</h2>
            <p>每张卡片都有独立的规划说明</p>
          </div>
          <span>规划中，尚未部署</span>
        </div>
        <div className="apps-grid">
          {apps.map((a) => (
            <AppCard key={a.slug} app={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
