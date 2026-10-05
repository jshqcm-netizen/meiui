import Link from "next/link";
import { BookOpenCheck, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  quickStartDocuments,
  selectCollection,
  type ContentSummary,
} from "@/lib/collection";
import { formatDate } from "@/lib/site";
import styles from "./collection.module.css";

export function CollectionOverview({
  entries,
  kind,
}: {
  entries: ContentSummary[];
  kind: "blog" | "docs";
}) {
  if (kind === "docs") {
    const guides = quickStartDocuments(entries);
    if (!guides.length) return null;
    return (
      <Card className={styles.quickStart}>
        <CardHeader className={styles.quickStartHeader}>
          <div className={styles.overviewLabel}>
            <BookOpenCheck aria-hidden="true" />
            初次使用
          </div>
          <CardTitle>
            <h2>从这里开始，一步步熟悉站点</h2>
          </CardTitle>
          <CardDescription>
            建议按顺序阅读，也可以直接找到眼前需要的那一篇。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className={styles.quickStartSteps}>
            {guides.map((entry, index) => (
              <li key={entry.slug}>
                <Link
                  href={`/docs/${entry.slug}/`}
                  className={styles.quickStartLink}
                >
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className={styles.stepContent}>
                    <strong>{entry.title}</strong>
                    <span>
                      {entry.readingMinutes} 分钟阅读
                      {entry.sample ? " · 示例内容" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    );
  }
  const latest = selectCollection(entries)[0];
  if (!latest) return null;
  return (
    <Card className={styles.latest}>
      <CardHeader className={styles.latestHeader}>
        <div className={styles.overviewLabel}>
          最近一篇<time dateTime={latest.date}>{formatDate(latest.date)}</time>
        </div>
        <CardTitle>
          <h2>
            <Link href={`/blog/${latest.slug}/`}>{latest.title}</Link>
          </h2>
        </CardTitle>
        <CardDescription>{latest.description}</CardDescription>
      </CardHeader>
      <CardFooter className={styles.latestFooter}>
        <div className={styles.latestMetadata}>
          <span>
            <Clock3 aria-hidden="true" />
            {latest.readingMinutes} 分钟阅读
          </span>
          {latest.sample && <Badge variant="outline">示例内容</Badge>}
        </div>
        <Link href={`/blog/${latest.slug}/`} className={styles.readLink}>
          阅读手记
        </Link>
      </CardFooter>
    </Card>
  );
}
