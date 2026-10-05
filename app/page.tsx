import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Code2,
  ChevronRight,
  Clock3,
  Sparkles,
  Braces,
} from "lucide-react";
import { getAllContent } from "@/lib/content";
import { apps, formatDate, site } from "@/lib/site";
import { AppCard } from "@/components/app-card";
import { Badge } from "@/components/ui/badge";
import { buildDashboard } from "@/lib/dashboard";
import { HomeLibrary, HomeTopicDock } from "@/components/home-library";
import styles from "@/components/home-workspace.module.css";
export default async function Home() {
  const entries = await Promise.all([getAllContent("blog"), getAllContent("docs")]);
  const { posts, docs, featured, sampleCount, topics } = buildDashboard(entries.flat());
  return (
    <div className="page home-page">
      <div className="page-heading">
        <div>
          <div className="greeting">
            Hello, world{" "}
            <span className="tiny-orbit" aria-hidden="true">
              ✳
            </span>
          </div>
          <h1>欢迎来到我的数字空间</h1>
          <p>关于 AI、工程与创造。想法在这里生长，经验在这里沉淀。</p>
        </div>
        <span className="edition-pill">
          <span />
          本地预览版 <b>v{site.version}</b>
        </span>
      </div>
      <div className={styles.overview}>
        <section className={styles.hero} aria-labelledby="home-feature-heading">
          <div className={styles.heroCopy}>
            <p className={styles.heroIntro}>探索，不止于想法</p>
            <h2 id="home-feature-heading">让探索，<br />有迹可循。</h2>
            <p className={styles.heroDescription}>
              写代码，做实验，整理一路上的发现。<br />
              让每一个小小的开始，都有延续。
            </p>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <Image src="/media/cobalt-glass.webp" alt="" fill priority
              sizes="(max-width: 1040px) 100vw, 60vw" />
          </div>
          <Link href={featured ? `/blog/${featured.slug}/` : "/blog/"}
            className={styles.featured}
            aria-label={featured ? `阅读精选手记：${featured.title}` : "浏览技术手记"}>
            <div className={styles.featuredCopy}>
              <div className={styles.featuredMeta}>
                <span>精选手记</span>
                {featured && <span>{featured.readingMinutes} 分钟阅读</span>}
                {featured?.sample && <Badge variant="outline">示例</Badge>}
              </div>
              <h3 className={styles.featuredTitle}>{featured?.title ?? "从技术手记开始探索"}</h3>
            </div>
            <span className={styles.featuredAction}>阅读</span>
          </Link>
        </section>
        <HomeLibrary posts={posts} docs={docs} sampleCount={sampleCount} />
      </div>
      <HomeTopicDock topics={topics} />
      <section className="home-section">
        <div className="section-heading">
          <div>
            <h2>
              应用空间 <span>{String(apps.length).padStart(2, "0")}</span>
            </h2>
            <p>不同的想法，各自有一个入口</p>
          </div>
          <Link href="/apps/" className="text-link">
            查看全部 <ChevronRight size={15} />
          </Link>
        </div>
        <div className="apps-grid">
          {apps.map((app) => (
            <AppCard app={app} key={app.slug} />
          ))}
        </div>
      </section>
      <div className="reading-grid">
        <section className="recent-panel glass-panel">
          <div className="section-heading">
            <h2>最近的手记</h2>
            <Link href="/blog/" className="text-link">
              全部手记 <ChevronRight size={15} />
            </Link>
          </div>
          <div className="recent-list">
            {posts.slice(0, 3).map((post, i) => (
              <Link
                href={`/blog/${post.slug}/`}
                className="recent-item"
                key={post.slug}
              >
                <div className={`article-mini mini-${i}`} aria-hidden="true">
                  {i === 0 ? <Braces /> : i === 1 ? <Sparkles /> : <Code2 />}
                </div>
                <div className="recent-copy">
                  <div className="recent-title">
                    <h3>{post.title}</h3>
                    {post.sample && <Badge variant="outline">示例</Badge>}
                  </div>
                  <p>{post.description}</p>
                  <div className="recent-meta">
                    <span>{formatDate(post.date)}</span>
                    <span>
                      <Clock3 size={12} />
                      {post.readingMinutes} 分钟
                    </span>
                    <span>{post.tags[0]}</span>
                  </div>
                </div>
                <ChevronRight className="recent-chevron" size={17} />
              </Link>
            ))}
          </div>
        </section>
        <section className="start-panel">
          <div className="start-heading">
            <span className="start-icon">
              <FileText size={20} />
            </span>
            <Badge variant="secondary">知识库</Badge>
          </div>
          <h2>
            好用的方法，
            <br />
            值得留下来。
          </h2>
          <p>
            从内容结构到发布流程，
            <br />
            让下一次开始更简单。
          </p>
          <div className="quick-docs">
            {docs.slice(0, 3).map((d) => (
              <Link key={d.slug} href={`/docs/${d.slug}/`}>
                <span>{d.title}</span>
                <ChevronRight size={15} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
