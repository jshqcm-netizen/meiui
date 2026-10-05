# 内容工作流

这个项目采用本地 Markdown 内容层。它不连接 CMS，不上传文章，不持有发布凭据，也不提供任意 MDX 执行能力。随项目提供的六篇公开内容都是 `sample: true` 的示例，正文与页面应同时显示示例标记。

## 文件与职责

```text
content/
  blog/<slug>.md
  docs/<slug>.md
public/media/                 # 本地图片、视频、字幕与公开附件
lib/content-types.ts         # 可供客户端使用的纯类型
lib/content.ts               # 构建时解析、校验与公开读取边界
lib/content-preview.ts       # 校验后生成独立、无脚本的本地阅读预览
scripts/content.ts          # 本地创建、预览和状态转换
scripts/check-content.ts    # 检查所有状态的内容
.content-preview/           # 本地预览，不进入 public/ 或 out/
```

正文只允许普通 Markdown 与 GFM（表格、任务列表、删除线等）。不要添加 `.mdx` 文件、嵌套内容目录、内容符号链接、JavaScript Frontmatter、HTML 标签、JSX、ESM import/export 或 MDX 表达式。需要解释这些语法时，将它们放入行内代码或代码块。

## Frontmatter

```yaml
---
title: 清楚的文章标题
description: 一段说明文章解决什么问题、适合谁阅读的简洁摘要。
slug: my-first-note
kind: blog
date: 2026-10-05
updated: 2026-10-06
tags: [内容, 工作流]
status: draft
sample: true
featured: false
---
```

- `kind`：`blog` 或 `docs`，必须与目录相同
- `slug`：小写英文字母和数字，以单个 `-` 分隔，最多 80 字符；必须与文件名相同
- `date`、`updated`：有效的 `YYYY-MM-DD` 日期；更新日期不能早于发布日期，`updated` 可省略
- `status`：`draft`、`review`、`published`
- `sample`：必须显式填写；演示、虚构或占位材料使用 `true`，不能把示例包装成亲身经历
- `featured`：可选，控制精选展示
- `videos`：可选，最多 3 个受控视频对象，字段与规则见下文；不使用正文 HTML 播放器
- `title`：1–100 字符；`description`：12–240 字符；`tags`：1–8 个不重复标签，每个最多 30 字符
- `readingMinutes`、`body`、`html`、`headings` 由程序生成，不写入 Frontmatter；未知字段会被拒绝

日期只是内容元数据，不是定时发布设置。`published` 的未来日期内容也会公开；如需等待，应保留 `draft` 或 `review`。

## 1. 新建

```bash
npm run content:new -- --kind blog --slug my-first-note --title "第一篇笔记"
npm run content:new -- --kind docs --slug sample-guide --title "示例指南" --sample
```

新建内容始终是 `draft`，默认 `sample: false`，不会覆盖已存在的文件。请立即补充真实摘要、标签和正文。内容是演示时使用 `--sample`。支持 `--description "摘要"` 和 `--date YYYY-MM-DD`；不提供日期则使用当天 UTC 日期。

## 2. 检查与本地预览

```bash
npm run content:check
npm run content:preview -- --kind blog --slug my-first-note
npm run content:status
```

检查器验证所有状态的文件，因此坏掉的草稿也会阻止构建。预览同样执行完整校验，再写入 `.content-preview/blog-my-first-note.html`。用浏览器打开终端输出的文件位置即可阅读；它带有 `noindex` 和限制脚本/资源的 CSP，但不要依靠 `noindex` 保密，也不要把预览目录加入部署产物。预览命令不会修改文章或状态，也不会写入 `public/`、`out/` 或公开搜索。

独立预览采用站点的冷蓝色阅读设计，但不加载站点应用、脚本或远程字体。它包含：

- 明确的本地状态、示例标记、摘要、标签、日期与阅读时长
- 从已校验正文生成的真实目录，重复标题也有独立锚点；窄屏上目录位于正文之前，可折叠
- 可通过键盘聚焦并横向滚动的代码块与表格，避免长行把整页撑宽
- 原生视频控件、海报、说明与字幕引用，不自动播放
- 当前 Markdown 的完整 SHA-256 指纹，终端与页面「核对当前版本」区域均可查看

`/media/` 图片、视频、海报、字幕，以及 PDF/TXT 等附件链接，统一转换为从 `.content-preview/` 出发的 `../public/media/` 路径。保留仓库目录结构即可从本地文件打开；移动单个 HTML 不会自动携带媒体。代码示例中的路径保持原样，HTTPS 引用和正文锚点也不改写。

非媒体的站内页面链接保持原来的根路径，需要在开发站点核对目标；独立文件不模拟站点路由。某些浏览器限制 file: 页面的字幕读取，应在已获准的隔离本地审核环境中核对字幕开关，并人工检查字幕内容。草稿不进入公开页面，不要为了验证链接或字幕而把文章临时标记为 `published`，也不要关闭浏览器安全限制。CLI 不会启动网络服务。

CSP 明确禁止脚本、联网请求、对象嵌入、框架与表单提交；仅允许本地图片/媒体和带匹配 SHA-256 的内置样式。不依赖内联脚本或外部字体。附件校验不是病毒扫描，打开 PDF 等文件前仍须确认来源可信。

预览是一次生成的快照，不会实时更新。修改正文、Frontmatter 或状态后，重新检查并生成预览；如果校验失败，先前成功的预览可能仍在，但不能代表新版本。源文件指纹仅标识 Markdown 的精确字节，不是发布批准记录，也不覆盖媒体文件的内容。媒体更换后同样需要重新校验、实际查看并审核。要删除一份预览，删除对应的本地 HTML 文件即可。

## 3. 进入人工审核

```bash
npm run content:status -- --kind blog --slug my-first-note --to review
npm run content:preview -- --kind blog --slug my-first-note
```

状态也是源文件的一部分，进入 `review` 后重新生成预览，再核查以下事项：

1. 标题、摘要、正文是否准确，来源是否真正支持结论
2. 有无编造经历、数据、评价、引语或项目成果
3. 是否包含密码、API Key、令牌、私人对话、未获准公开的资料
4. 示例是否标注，媒体来源与使用权是否清楚
5. 代码是否可理解，命令是否说明前提与可能后果
6. 链接、目录、图片 alt、表格、代码块与移动端阅读是否正常
7. 审核的目标文件、当前状态与 SHA-256 是否对应当前版本；审阅后若有修改，是否已重新检查和预览
8. 内容所有者是否看过当前版本，并明确批准公开

## 4. 得到明确批准后，标记可公开

```bash
npm run content:status -- --kind blog --slug my-first-note --to published --approve
npm run content:check
npm run typecheck
npm test
npm run build
```

CLI 要求先从 `draft` 转到 `review`，并在进入 `published` 时提供 `--approve`。只有在内容所有者已经针对这篇当前版本给出明确批准后才能使用该标记。AI 不能把完成草稿、请求预览、沉默或先前对另一篇文章的批准当成发布授权。

`--approve` 是本地操作保护，**不是强制访问控制或身份认证**。拥有仓库写权限的人仍能直接修改 Frontmatter。生产流程还应依靠仓库权限、分支保护和人工代码审查。不要给写作代理不必要的部署或仓库凭据。

改变状态只修改本地文件；它不会提交 Git、推送、部署或联系第三方。执行这些后续动作需要单独的授权和实际部署配置。`npm run build` 仅生成静态文件。

## 修改与撤回

```bash
npm run content:status -- --kind blog --slug my-first-note --to review
# 修改文章、预览、重新审核并取得批准
npm run content:status -- --kind blog --slug my-first-note --to published --approve
```

也可以将内容退回 `draft`。下次构建时，它将从公开路由和搜索中移除。已有远端站点、缓存或他人的副本不会自动删除；这需要另行处理。修改公开文章时按需更新 `updated`，CLI 不会替作者自动虚构更新时间。

## 媒体边界

- 路径必须形如 `/media/example.webp`，文件放在 `public/media/`
- 支持 `.png`、`.jpg`、`.jpeg`、`.webp`、`.avif`、`.gif`；不支持 SVG
- 每个文件最多 5 MiB，每篇文章最多 12 张图片；每张图必须有非空 alt
- 校验真实文件是否存在、文件大小、扩展名、基础文件签名和解析后的路径边界
- 拒绝远程图片、追踪 URL、query/hash、编码路径、`..` 和逃逸媒体目录的符号链接
- 图片签名检测不等于完整解码或恶意文件扫描；仍需人工检查来源、内容和隐私元数据
- 外部链接允许 HTTPS；站内链接允许安全根路径与片段锚点。拒绝 HTTP、协议相对链接、`javascript:`、`data:`、带凭据 URL 与路径穿越

本地页面链接只做协议和路径安全检查，不自动证明目标路由存在；发布审核仍须检查实际页面。`/media/` 附件链接则会检查真实文件。检查器不会联网访问任何引用来源。

### 视频和字幕

视频使用受控 Frontmatter 对象，不允许把 `<video>` 标签写入 Markdown。类型为：

```ts
interface ContentVideo {
  src: string;
  title: string;
  caption: string;
  hasSpeech: boolean;
  poster?: string;
  captions?: string;
}
```

```yaml
videos:
  - src: /media/content-workflow-sample.mp4
    title: 本地内容工作流示例动画
    caption: 无语音概念演示，不是实际系统操作录像。
    hasSpeech: false
    poster: /media/content-workflow-sample.png
    captions: /media/content-workflow-sample.vtt
```

- `src` 只接受本地 `.mp4` / `.webm`，每个最多 25 MiB，每篇最多 3 个；检查路径、存在性和基础容器签名
- `title` 为非空无障碍名称（最多 100 字符）；`caption` 为必填可见说明（最多 300 字符）
- `hasSpeech` 必须显式写 `true` 或 `false`。有语音时 `captions` 必填，内容所有者要人工核对字幕准确性
- `poster` 可选，复用普通图片的完整检查
- `captions` 只接受 UTF-8 `.vtt`，最大 128 KiB，包含 WEBVTT 文件头和时间轴；禁止 STYLE 块和可执行标记
- 页面通过 React 渲染原生 `<video controls preload="metadata">`，无 autoplay，不添加第三方播放器或追踪服务
- 校验不是完整容器解码、编解码兼容性保证或字幕语义审核；需在目标浏览器实际播放

项目包含一段 5 秒、960×540 的本地生成无语音 MP4 概念示例和对应海报、字幕，挂载于媒体规范示例文档。它明确标注 SAMPLE，不包含个人信息，也不冒充实际系统操作记录。

### 本地下载附件

普通 Markdown 链接可指向 `/media/guide.pdf` 或 `/media/readme.txt`。PDF 最大 10 MiB，必须有 PDF 文件签名；TXT 最大 1 MiB，必须为不含危险控制字符的 UTF-8 文本。本地图片、视频与字幕也可以被链接，并复用对应校验。

这些检查不是病毒扫描或 PDF 主动内容清理，附件只能来自可信、获准公开的来源。`.html`、`.js`、可执行文件、任意压缩包等不在允许列表。

**public/media 中所有文件都会随静态站点公开，与引用文章的状态无关。** 草稿正文不会导出，但把私人媒体放进 public/ 仍然可能公开它。保密素材应留在站点公共目录之外，只有获得公开批准后才复制入 public/media。

## 程序接口

```ts
getAllContent(kind?: 'blog' | 'docs'): Promise<ContentEntry[]>
getContent(kind, slug): Promise<ContentEntry | undefined>
getSearchIndex(): Promise<ContentSearchEntry[]>
```

这些公共接口只返回 `published`。页面路由、静态参数生成、站点地图、RSS 和搜索都应从这些接口取数据。`getContent` 对无效 slug 与未公开内容返回 `undefined`。

`ContentEntry` 附带安全 `html`、原始 `body`、派生阅读时长和真实目录。目录格式为 `{ id, text, level }`，ID 统一使用 `section-` 前缀，并处理重复标题。正文已完成 HTML 清理，页面仍应只把这个受控结果交给 HTML 渲染容器。

`getSearchIndex` 返回轻量纯文本字段：`title`、`description`、`kind`、`slug`、`tags`、`href`、`text`、`sample`。不要在客户端使用编辑器接口 `loadAllContent`，也不要自行扫描整个内容目录再序列化，否则会绕过发布边界。

解析流水线：安全 YAML core schema → Zod 严格元数据 → remark-parse / remark-gfm → Markdown 安全检查 → remark-rehype → rehype-sanitize → rehype-stringify。不执行文章代码，不引入 MDX 编译器。

## AI 写作入口

仓库技能 `.agents/skills/qcm-content-authoring/SKILL.md` 说明了 AI 的边界：可以在约定范围内起草、修改、检查、预览和提交审核；未经当前内容的明确批准，不得设置 `published` 或使用 `--approve`。不得读取或发送秘密、上传私人内容，或把安全限制改掉来让内容通过。

## 测试与底层命令

```bash
npm test
node --import tsx --test tests/content.test.ts
node --import tsx --test tests/content-preview.test.ts tests/content.test.ts
# 普通开发环境也可使用：
npx tsx --test tests/content.test.ts
```

覆盖视频/字幕/附件的格式、大小、路径与语音字幕要求，以及 schema、真实日期、slug/路径穿越、可执行 YAML 引擎、重复键/别名/自定义标签、HTML/MDX、危险协议、图片大小与路径、草稿/待审隔离、搜索泄漏、状态批准和本地预览。独立预览测试还验证目录锚点、状态与示例标记、元数据转义、精确样式 CSP、源文件指纹、附件相对路径、代码示例不被改写、校验失败时不覆盖旧预览，以及拒绝将预览目录符号链接到公共目录。

所有内容命令也可通过单一入口运行：

```bash
npm run content -- new --kind blog --slug my-first-note --title "第一篇笔记"
npm run content -- preview --kind blog --slug my-first-note
npm run content -- status --kind blog --slug my-first-note --to review
```
