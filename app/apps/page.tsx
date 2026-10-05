import type { Metadata } from "next";
import { apps } from "@/lib/site";
import { AppCard } from "@/components/app-card";
import { Layers3 } from "lucide-react";
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
      <div className="apps-grid apps-page-grid">
        {apps.map((a) => (
          <AppCard key={a.slug} app={a} />
        ))}
      </div>
      <div className="planning-notice">
        <Layers3 size={22} />
        <div>
          <h2>这里展示的是应用规划</h2>
          <p>
            这些子域名尚未连接或部署。当前卡片打开本地介绍页；等应用准备好，再将入口切换到真实地址。
          </p>
        </div>
      </div>
    </div>
  );
}
