import Link from "next/link";
import {
  BookOpen,
  Clock3,
  FileText,
  Sparkles,
  Braces,
  Wrench,
} from "lucide-react";
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
  groupDocuments,
  selectCollection,
  type CollectionView,
  type ContentSummary,
} from "@/lib/collection";
import { formatDate } from "@/lib/site";
import { cn } from "@/lib/utils";
import styles from "./collection.module.css";

function CollectionCard({
  entry,
  kind,
}: {
  entry: ContentSummary;
  kind: "blog" | "docs";
}) {
  const CoverIcon = entry.tags.includes("AI")
    ? Sparkles
    : entry.tags.includes("工具")
      ? Wrench
      : Braces;
  return (
    <Link
      href={`/${kind}/${entry.slug}/`}
      className={cn(
        kind === "blog" ? "article-card" : "doc-card",
        styles.entryLink,
      )}
    >
      <Card className={styles.entryCard}>
        {kind === "blog" && (
          <div className={styles.cover} aria-hidden="true">
            <span className={styles.coverTopic}>{entry.tags[0]}</span>
            <CoverIcon className={styles.coverIcon} strokeWidth={1.1} />
            <span className={styles.coverDate}>
              {entry.date.slice(0, 7).replace("-", " / ")}
            </span>
          </div>
        )}
        <CardHeader className={styles.entryHeader}>
          <div className={styles.entryLabels}>
            {kind === "docs" && (
              <FileText className={styles.documentIcon} aria-hidden="true" />
            )}
            {entry.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {entry.sample && <Badge variant="outline">示例内容</Badge>}
          </div>
          <CardTitle>
            <h2 className={styles.entryTitle}>{entry.title}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.entryContent}>
          <CardDescription>{entry.description}</CardDescription>
        </CardContent>
        <CardFooter className={styles.entryFooter}>
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          <span>
            <Clock3 aria-hidden="true" />
            {entry.readingMinutes} 分钟阅读
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function CollectionCards({
  entries,
  kind,
  view = "grid",
  grouped = false,
}: {
  entries: ContentSummary[];
  kind: "blog" | "docs";
  view?: CollectionView;
  grouped?: boolean;
}) {
  if (kind === "docs" && grouped && view === "grid") {
    return (
      <div className={styles.documentGroups}>
        {groupDocuments(entries).map(({ topic, entries: group }) => (
          <section
            key={topic}
            className={styles.documentGroup}
            aria-label={`${topic}文档`}
          >
            <div className={styles.groupHeading}>
              <h3>{topic}</h3>
              <span>{group.length} 篇</span>
            </div>
            <div className={styles.documentGrid}>
              {group.map((entry) => (
                <CollectionCard key={entry.slug} entry={entry} kind={kind} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(styles.entries, view === "list" && styles.listView)}
      data-view={view}
    >
      {entries.map((entry) => (
        <CollectionCard key={entry.slug} entry={entry} kind={kind} />
      ))}
    </div>
  );
}

/** Public links are included in the static HTML while query controls hydrate. */
export function CollectionFallback({
  entries,
  kind,
}: {
  entries: ContentSummary[];
  kind: "blog" | "docs";
}) {
  return (
    <section
      className={styles.fallback}
      aria-label={kind === "blog" ? "全部技术手记" : "全部知识文档"}
    >
      <p className={styles.fallbackNotice}>
        <BookOpen aria-hidden="true" />
        全部 {entries.length} 篇{kind === "blog" ? "技术手记" : "知识文档"}
      </p>
      <CollectionCards
        entries={selectCollection(entries)}
        kind={kind}
        grouped={kind === "docs"}
      />
    </section>
  );
}
