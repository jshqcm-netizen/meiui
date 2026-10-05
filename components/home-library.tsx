import Link from "next/link";
import { BookOpen, FileText, Library } from "lucide-react";
import type { ContentSummary } from "@/lib/collection";
import type { TopicShortcut } from "@/lib/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import styles from "./home-workspace.module.css";

export function HomeLibrary({ posts, docs, sampleCount }: {
  posts: ContentSummary[];
  docs: ContentSummary[];
  sampleCount: number;
}) {
  const collections = [
    { kind: "blog", label: "手记", entries: posts, icon: BookOpen },
    { kind: "docs", label: "文档", entries: docs, icon: FileText },
  ] as const;
  return (
    <Card className={styles.library} aria-labelledby="home-library-title">
      <CardHeader>
        <div className={styles.panelHeading}>
          <CardTitle><h2 id="home-library-title">阅读书架</h2></CardTitle>
          <Library size={19} aria-hidden="true" />
        </div>
        <CardDescription>选一篇手记，或从一份指南开始</CardDescription>
      </CardHeader>
      <CardContent className={styles.libraryBody}>
        <Tabs defaultValue="blog" className={styles.libraryTabs}>
          <TabsList aria-label="选择阅读内容类型" className={styles.tabList}>
            {collections.map(({ kind, label, entries, icon: Icon }) => (
              <TabsTrigger key={kind} value={kind} aria-label={`${label}，${entries.length} 篇`}>
                <Icon aria-hidden="true" />
                {label}<span className={styles.tabCount}>{entries.length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {collections.map(({ kind, label, entries }) => (
            <TabsContent key={kind} value={kind} className={styles.tabPanel}>
              {entries.length ? (
                <ul className={styles.libraryList}>
                  {entries.slice(0, 2).map((entry) => (
                    <li key={entry.slug}>
                      <Link href={`/${kind}/${entry.slug}/`} className={styles.libraryLink}>
                        <div className={styles.libraryMeta}>
                          <span>{entry.tags[0]}</span>
                          <span>{entry.readingMinutes} 分钟</span>
                          {entry.sample && <Badge variant="outline">示例</Badge>}
                        </div>
                        <div className={styles.libraryTitle}>
                          <h3>{entry.title}</h3>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty className={styles.libraryEmpty}>
                  <EmptyHeader>
                    <EmptyTitle>还没有公开{label}</EmptyTitle>
                    <EmptyDescription>发布后的内容会出现在这里</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <Link href={`/${kind}/`} className={styles.collectionLink}>
                查看全部{label}<span>{entries.length} 篇</span>
              </Link>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className={styles.libraryFoot}>
        <span>{sampleCount ? `书架含 ${sampleCount} 篇示例内容` : "这里收录已公开的手记与文档"}</span>
      </CardFooter>
    </Card>
  );
}

export function HomeTopicDock({ topics }: { topics: TopicShortcut[] }) {
  if (!topics.length) return null;
  return (
    <nav className={styles.topicDock} aria-label="从主题继续阅读">
      <div className={styles.topicHeading}>
        <BookOpen size={17} aria-hidden="true" />
        <span>从兴趣出发</span>
      </div>
      <ul>
        {topics.map((topic) => (
          <li key={`${topic.kind}:${topic.tag}`}>
            <Link href={topic.href} aria-label={`${topic.tag}，${topic.count} 篇${topic.kind === "blog" ? "手记" : "文档"}`}>
              <strong>{topic.tag}</strong>
              <span>{topic.count} 篇{topic.kind === "blog" ? "手记" : "文档"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
