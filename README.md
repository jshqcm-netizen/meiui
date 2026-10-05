# qcm.dev

一个中文优先、公开阅读导向的个人技术主站：磨砂玻璃仪表盘、技术手记、知识文档，以及未来子应用的统一入口。

**当前交付：qcm.dev 网站源代码。指定 GitHub 仓库：https://github.com/jshqcm-netizen/meiui 。没有部署网站、绑定域名、创建账户或配置后台。** 随附内容明确标注为示例。站点保留 `noindex` 与禁止索引的 robots.txt，直到正式发布审核。

## 快速开始

需要 Node.js 22 或更新版本、npm。已使用 Node 24 验证。无需 API Key、数据库或其他环境变量。

```bash
npm ci
npm run dev
# 打开 http://127.0.0.1:3000
```

生产构建与本地预览：

```bash
npm run build
npm run preview
# 打开 http://127.0.0.1:3000
```

GitHub 仓库不包含依赖目录、构建缓存或 `out/`，克隆后请先执行 `npm ci` 与 `npm run build`。单独提供的本地 ZIP 快照包含已经构建的 `out/`，解压后可以直接执行 `node scripts/serve.mjs` 预览；修改源码后仍需重新构建。

`npm run build` 输出 `out/`；`npm run preview` 使用仓库内的只读静态服务器，只监听本机地址。它不是生产后台。按 Ctrl+C 停止预览。若端口冲突，先停止已运行的开发服务，或设置 `PORT=3001 npm run preview`。

## 已经实现

- 明暗两套磨砂玻璃主题，选择保存在本机；原创环境纹理、多层透光表面和移动端导航
- 首页阅读书架 Tabs、精选手记、真实主题篇数；中英文技术排版和本地字体
- 博客与文档列表、主题篇数、组合搜索、四种排序、网格/列表切换和空结果提示
- 文档入门入口、按首主题分组，以及 SSR 初始内容链接
- Cmd/Ctrl+K 全站搜索、方向键选择与中文输入保护；手机 Sheet 导航和 Radix 焦点管理
- 独立文章/文档地址、可折叠完整目录、阅读时长、标签、相关文章、404
- 代码语言标签、键盘滚动与点击复制；拒绝复制时给出明确提示
- 3 个规划中应用的介绍页、主站/子应用关系图和 Accordion 常见问题；链接均指向本站说明
- 普通 Markdown / GFM：代码、表格、列表、图片；安全本地媒体与原生视频播放
- 内容严格元数据校验、草稿隔离、本地预览、审核状态及显式批准门槛
- 与阅读页一致的冷蓝色草稿审阅界面、修复本地附件链接、精确源文件 SHA-256 版本指纹
- 仓库级 AI 内容创作技能、内容和媒体规范、安全测试
- Next.js 静态导出，无运行时账户、密钥、写入端点或数据库

## 路由

- `/` 主站总览
- `/blog/` 与 `/blog/<slug>/` 技术手记
- `/docs/` 与 `/docs/<slug>/` 知识文档
- `/apps/` 与 `/apps/ai/`、`/apps/agents/`、`/apps/admin/` 应用规划

`ai.qcm.dev` 是预留的 AI 入口；`agents.qcm.dev` 与 `admin.qcm.dev` 是待确认概念，不是已批准实施的后台或智能体产品。配置见 `lib/site.ts`。

## 内容怎么写

```bash
npm run content:new -- --kind blog --slug first-note --title "第一篇笔记"
npm run content:check
npm run content:preview -- --kind blog --slug first-note
npm run content:status -- --kind blog --slug first-note --to review
# 人工审核当前版本并明确批准以后：
npm run content:status -- --kind blog --slug first-note --to published --approve
```

`published` 仅决定本地构建中的可见性，不会执行 Git 提交、推送或部署。代码写权限仍能绕过本地状态门槛；它不冒充身份认证或强制权限系统。

- 完整操作：[内容工作流](docs/CONTENT-WORKFLOW.md)
- AI 技能：[qcm-content-authoring](.agents/skills/qcm-content-authoring/SKILL.md)
- 设计与选型：[设计说明](docs/DESIGN.md)
- 依赖/素材：[第三方声明](THIRD-PARTY-NOTICES.md)
- 第三版变化：[玻璃工作台](docs/ITERATION-3.md)
- 验证记录：[QA 报告](docs/QA.md)

MDX/JSX/原始 HTML 和可执行 Frontmatter 均未开启。普通 Markdown 是首版的安全规范格式；Word/Notion 等内容需先转换和审核，不声称已经具备导入器。

## 项目结构

```text
app/                        # 静态导出页面
components/                 # 页面组件与轻量 Radix 包装
lib/site.ts                 # 站点、应用与导航配置
lib/content.ts              # 安全内容读取边界
content/blog/               # Markdown 手记
content/docs/               # Markdown 文档
public/media/               # 本地图片、视频、附件
scripts/                    # 内容命令和本地预览
.agents/skills/              # 内容协作技能
```

技术栈：Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix Primitives、Lucide、unified/remark/rehype、Zod。精确安装版本以 package-lock.json 为准。已通过官方 registry 安装并审阅 shadcn Command、Sheet、Empty、Separator、Tabs、Accordion、Select、Input；基础 Dialog 保留已有 Radix 包装。首页与应用空间使用 shadcn Card 和 Magic UI MagicCard；仅保留应用卡片的克制指针高光，并遵循减少动态效果偏好。主题通过 next-themes 和 Radix ToggleGroup 控制。第三版说明见 docs/ITERATION-3.md。

## 验证

```bash
npm run check
```

可单独运行 `npm run typecheck`、`npm run lint`、`npm test`、`npm run content:check`。第三版共有 47 项单元测试。`npm run test:ui:list` 可检查浏览器测试发现，真正的浏览器验收需要执行 `npm run test:ui`；受限环境中不可把 list 的通过当成截图或交互通过。最后的静态文件验证见 `scripts/check-export.py`。

## Git 和下一阶段

本仓库保存完整源码、内容、媒体、测试与依赖锁文件；不包含凭据、依赖目录或生成的构建文件。GitHub 连接器使用已授权账户的提交身份。单独提供的 ZIP 不包含 .git，保留其生成时的本地快照说明。

1. 克隆仓库，运行 `npm ci` 与 `npm run check`，再进行本地浏览器验收
2. 审阅/替换示例内容、名称和应用规划；确认公开前移除 noindex
3. 选定托管方案并明确授权发布，配置 qcm.dev、HTTPS 与安全响应头
4. 之后再独立设计 AI 应用、后台身份验证、授权/审计和存储

没有 OAuth、GitHub 自动发布、生产 CMS、后台登录、模型调用、支付或自动运行智能体。后续应用的功能、数据范围、凭据与费用需要单独确认。

## 安全说明

`public/` 会原样进入静态输出，不要将任何未公开资料、令牌或私人媒体放进去。草稿正文保存在 `content/` 且被公开读取层排除。内容校验不取代人工事实核查、授权审核、媒体解码/恶意文件扫描或生产权限控制。详见内容工作流与 AI 技能。
