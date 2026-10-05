import Link from "next/link";
import { FileText, Globe2, PanelsTopLeft, Sparkles, Workflow } from "lucide-react";
import { apps, site, type AppEntry } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import styles from "./app-workspace.module.css";

const appIcons = { sparkles: Sparkles, workflow: Workflow, panels: PanelsTopLeft };

export function AppDomainMap() {
  return (
    <Card className={styles.domainCard} aria-labelledby="app-domain-title">
      <CardHeader>
        <div className={styles.cardHeading}>
          <CardTitle><h2 id="app-domain-title">一个主站，各自生长</h2></CardTitle>
          <Badge variant="outline">域名规划</Badge>
        </div>
        <CardDescription>主站组织公开内容，子应用保留各自的用途与边界</CardDescription>
      </CardHeader>
      <CardContent>
        <nav className={styles.domainMap} aria-label="主站与规划子应用的关系">
          <div className={styles.parentNode}>
            <Link href="/" aria-label={`${site.name} 主站，返回总览`}>
              <span className={styles.parentIcon}><Globe2 size={23} aria-hidden="true" /></span>
              <strong>{site.name}</strong>
              <span>手记 · 文档 · 应用入口</span>
            </Link>
          </div>
          <ul className={styles.childNodes} aria-label={`${site.name} 下的规划子域名`}>
            {apps.map((app) => {
              const Icon = appIcons[app.icon];
              return (
                <li key={app.slug}>
                  <Link href={`/apps/${app.slug}/`} data-tone={app.accent}
                    aria-label={`${app.domain}，${app.title}，查看本地规划介绍`}>
                    <span className={styles.childIcon}><Icon size={18} aria-hidden="true" /></span>
                    <span className={styles.childCopy}><strong>{app.domain}</strong><span>{app.title}</span></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </CardContent>
      <CardFooter className={styles.domainFoot}>
        <span>{apps.filter((app) => app.status === "planned").length} 个子域名均为规划地址，点击后查看本站介绍页</span>
      </CardFooter>
    </Card>
  );
}

export function AppPlanningFaq() {
  return (
    <Card className={styles.faqCard} aria-labelledby="app-faq-title">
      <CardHeader>
        <CardTitle><h2 id="app-faq-title">开始之前</h2></CardTitle>
        <CardDescription>当前状态与使用方式</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="availability" className={styles.accordion}>
          <AccordionItem value="availability">
            <AccordionTrigger>这些应用现在可以使用吗？</AccordionTrigger>
            <AccordionContent>
              <p>这里展示的是应用规划。子域名尚未连接或部署，卡片只打开本站的介绍页，不会启动应用。</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger>需要登录或提供数据吗？</AccordionTrigger>
            <AccordionContent>
              <p>阅读主站内容无需登录。目前没有账户系统、在线后台、模型调用或运行中的智能体，也没有付费功能。</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="next">
            <AccordionTrigger>如何使用这些规划？</AccordionTrigger>
            <AccordionContent>
              <p>先打开一个应用介绍，了解用途与当前边界。要调整站点和内容，可从已有的本地开发与发布文档开始。</p>
              <Link href="/docs/getting-started/">阅读入门文档</Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function AppPlanDetails({ app }: { app: AppEntry }) {
  return (
    <Card className={styles.detailsCard} aria-labelledby="app-plan-title">
      <CardHeader>
        <CardTitle><h2 id="app-plan-title">规划说明</h2></CardTitle>
        <CardDescription>先说清用途，再决定下一步</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["purpose", "boundary"]} className={styles.accordion}>
          <AccordionItem value="purpose">
            <AccordionTrigger>想解决什么问题？</AccordionTrigger>
            <AccordionContent><p>{app.description}</p><p>{app.details[0]}</p></AccordionContent>
          </AccordionItem>
          <AccordionItem value="boundary">
            <AccordionTrigger>目前的边界是什么？</AccordionTrigger>
            <AccordionContent><p>{app.details[2]}</p><p>当前页面仅用于介绍规划，预留域名尚未连接或部署。</p></AccordionContent>
          </AccordionItem>
          <AccordionItem value="next">
            <AccordionTrigger>下一步从哪里开始？</AccordionTrigger>
            <AccordionContent><p>{app.details[1]}</p><p>开发与上线需要另行确认。先了解主站的本地结构与内容约定，再选择适合的实现方式。</p></AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className={styles.detailsFoot}>
        <FileText size={17} aria-hidden="true" />
        <Link href="/docs/getting-started/">了解主站结构</Link>
      </CardFooter>
    </Card>
  );
}
