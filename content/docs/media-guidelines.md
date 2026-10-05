---
title: 媒体与引用规范
description: 为图片、代码和外部来源设置清晰边界，避免追踪图片、危险路径与缺乏上下文的技术示例进入文章。
slug: media-guidelines
kind: docs
date: 2026-10-05
tags: [媒体, 可访问性, 安全]
status: published
sample: true
videos:
  - src: /media/content-workflow-sample.mp4
    title: 本地内容工作流示例动画
    caption: 五秒无语音示例动画，展示草稿、审核与批准的概念顺序；不是实际系统操作录像。
    hasSpeech: false
    poster: /media/content-workflow-sample.png
    captions: /media/content-workflow-sample.vtt
---

> 示例文档：文末提供一段本地生成的无语音示例动画，其余代码块中的路径用于说明格式。

## 图片使用本地路径

文章图片放入 public/media，并使用以 /media/ 开始的路径。支持 PNG、JPEG、WebP、AVIF 和 GIF。单个文件不能超过 5 MiB，每篇文章最多 12 张图片；文件扩展名和基础签名必须匹配。

下面只是代码块中的语法示例。使用前需要准备真实文件，确认来源和使用权，再替换为自己的说明。

```markdown
![截图展示搜索结果与清晰可见的键盘焦点](/media/search-example.webp)
```

禁止远程图片 URL、SVG、查询参数和路径穿越。检查器会确认文件实际存在，也会拒绝指向媒体目录之外的符号链接。这些限制用于控制内容边界，不能代替完整的恶意文件扫描。

## 替代文字应说明信息

alt 文字帮助无法看见图片的读者理解内容。与其写「截图」，更有用的描述是说明截图展示了哪个状态、哪个变化或哪个操作结果。重要信息不应只存在于图片里，正文还应有可阅读的文字说明。

上传前去掉不必要的定位信息和私人数据。人物、聊天截图和账户页面需要特别检查；未经确认，不要把真实的个人信息用于演示。

## 引用链接与代码

外部链接只允许 HTTPS，站内链接使用根路径，文章内部可以使用锚点。不支持可执行协议和携带账号密码的 URL。引用应尽量指向直接支持当前结论的来源页面。

代码块可以展示 JavaScript、Shell 和 HTML 等文本，但不会作为文章代码执行。正文不接受 HTML 标签、JSX 和 MDX 表达式；需要展示这些语法时，使用代码块或行内代码。

## 在发布前再看一遍

- 图片清晰且大小合适，不依靠超大文件维持细节
- alt 与正文可以说明关键内容
- 文件不包含密钥、私人截图或未经许可的素材
- 引用链接与文字结论对应，失效来源已处理
- 手机端图片和表格不会把整页撑出屏幕


## 受控视频与字幕

视频使用 Frontmatter 的 videos 数组，正文不能写 HTML 播放器。支持本地 MP4 和 WebM，单个视频最多 25 MiB，每篇最多 3 个。页面使用浏览器原生控制栏，不自动播放，不加载第三方播放器。

每段视频需要 title、可阅读的 caption 和明确的 hasSpeech。包含语音时必须提供本地 WebVTT 字幕；纯画面演示也建议提供文字说明。可选 poster 会通过与正文图片相同的检查。

```yaml
videos:
  - src: /media/content-workflow-sample.mp4
    title: 本地内容工作流示例动画
    caption: 无语音示例动画，用于说明内容状态顺序。
    hasSpeech: false
    poster: /media/content-workflow-sample.png
    captions: /media/content-workflow-sample.vtt
```

本页附带的五秒动画是生成的概念示例，不是用户操作记录。字幕文件最大 128 KiB，需要 UTF-8 编码、WEBVTT 标记与时间轴；不支持字幕 STYLE 块或可执行标记。

## 本地附件链接

可使用普通 Markdown 链接引用 public/media 中的 PDF 或 TXT。PDF 最大 10 MiB，TXT 最大 1 MiB；检查器会验证真实文件、路径边界、基础格式和大小。它不是恶意文件扫描器或 PDF 清理器，应只使用可信来源的附件。

public/media 中的文件会随静态站点公开，不受文章 draft 或 review 状态保护。私人附件和未获准公开的素材不要放入这个目录。
