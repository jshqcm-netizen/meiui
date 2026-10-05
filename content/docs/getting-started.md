---
title: 从这里开始
description: 了解这份个人网站示例的页面结构、内容约定与本地运行方式，找到第一次修改最适合开始的位置。
slug: getting-started
kind: docs
date: 2026-10-05
tags: [开始使用, 本地开发]
status: published
sample: true
---

> 示例文档：介绍随站点交付的本地项目与示例内容。上线地址、账户和部署配置需要由所有者单独确认。

## 站点里有什么

主页集中展示介绍、文章和应用入口。博客用于完整的技术表达，文档用于可重复的操作步骤。示例内容均带有标记，不应被当作作者的真实经历或已完成项目记录。

- [博客](/blog/)：浏览示例文章与主题标签
- [应用](/apps/)：探索工具与应用入口
- [文档](/docs/)：查看开发、内容与媒体说明
- [发布内容](/docs/publishing-content/)：从新建草稿到人工确认

## 在本地运行

在项目目录安装依赖，再启动开发服务器。终端会给出本地地址。

```bash
npm install
npm run dev
```

默认内容放在 content/blog 和 content/docs，媒体统一放在 public/media。修改一篇 Markdown 后，先运行检查，再在本地页面查看结果。

```bash
npm run content:check
npm run typecheck
npm test
npm run build
```

## 第一次修改建议

先替换一处已经确认的个人信息，再新建一篇 draft。不要批量去掉 sample 标记；它表示读者正在看到演示内容，只有在文本已被真实材料替换并经过确认后才应改为 false。

代码、网站配置与文章有不同的边界。普通写作无需修改页面组件，也无需添加账号或部署凭据。图片准备方式见[媒体规范](/docs/media-guidelines/)。
