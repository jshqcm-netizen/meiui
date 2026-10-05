import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  FileText,
  Layers3,
  Code2,
  ChevronRight,
  Clock3,
  Sparkles,
  Braces,
  Compass,
} from "lucide-react";
import { getAllContent } from "@/lib/content";
import { apps, formatDate, site } from "@/lib/site";
import { AppCard } from "@/components/app-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
export default async function Home() {
  const posts = await getAllContent("blog");
  const docs = await getAllContent("docs");
  const sampleCount = [...posts, ...docs].filter(
    (entry) => entry.sample,
  ).length;
  const featured = posts.find((p) => p.featured) ?? posts[0];
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
      <div className="overview-grid">
        <section className="feature-panel">
          <div className="feature-content">
            <span className="feature-label">
              <span className="label-line" />
              探索，不止于想法
            </span>
            <h2>
              让探索，
              <br />
              有迹可循。
            </h2>
            <p>
              写代码，做实验，整理一路上的发现。
              <br />
              让每一个小小的开始，都有延续。
            </p>
            <Button asChild variant="default">
              <Link href={featured ? `/blog/${featured.slug}/` : "/blog/"}>
                <BookOpen data-icon="inline-start" />
                阅读精选手记
              </Link>
            </Button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <Image
              src="/media/cobalt-glass.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          <span className="feature-corner">Ideas into things.</span>
        </section>
        <Card className="notebook-panel">
          <CardHeader>
            <div className="section-card-heading">
              <CardTitle>
                <h2>空间一览</h2>
              </CardTitle>
              <Compass size={19} />
            </div>
            <CardDescription>从一个想法，到一份积累</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog/" className="notebook-stat">
              <div className="stat-icon blue">
                <BookOpen size={19} />
              </div>
              <div>
                技术手记<span>实验、思考与实践</span>
              </div>
              <strong>{String(posts.length).padStart(2, "0")}</strong>
            </Link>
            <Link href="/docs/" className="notebook-stat">
              <div className="stat-icon peach">
                <FileText size={19} />
              </div>
              <div>
                知识文档<span>可复用的步骤与方法</span>
              </div>
              <strong>{String(docs.length).padStart(2, "0")}</strong>
            </Link>
            <Link href="/apps/" className="notebook-stat">
              <div className="stat-icon green">
                <Layers3 size={19} />
              </div>
              <div>
                应用规划<span>留给下一次构建</span>
              </div>
              <strong>{String(apps.length).padStart(2, "0")}</strong>
            </Link>
          </CardContent>
          <CardFooter>
            <div className="notebook-foot">
              <span className="tiny-dot" />
              {sampleCount
                ? `${sampleCount} 篇示例内容，供结构与阅读演示`
                : "阅读公开手记与文档"}
            </div>
          </CardFooter>
        </Card>
      </div>
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
                    <span className="sample-label">示例</span>
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
