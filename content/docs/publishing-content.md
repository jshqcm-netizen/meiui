---
title: 内容发布流程
description: 用本地命令创建 Markdown 草稿、检查安全边界、生成独立预览，并在明确批准后进入公开内容集合。
slug: publishing-content
kind: docs
date: 2026-10-05
tags: [内容, 工作流, AI]
status: published
sample: true
---

> 示例文档：命令用于本地内容维护。将状态改为 published 不会上传文件，也不会自动部署网站。

## 1. 创建草稿

选择 blog 或 docs，使用小写英文、数字和单个连字符组成 slug。命令不会覆盖已有文件。

```bash
npm run content:new -- --kind blog --slug my-first-note --title "第一篇笔记"
```

新内容始终从 draft 开始。按需补充标题、摘要、标签和正文。如果内容只是演示，在创建时加入 --sample；不要将虚构经历当作真实材料发布。

## 2. 检查与预览

```bash
npm run content:check
npm run content:preview -- --kind blog --slug my-first-note
```

检查覆盖 Frontmatter、文件名、链接和本地图片。预览会生成独立的本地 HTML 文件；draft 和 review 都能预览，但不会进入公开路由或搜索索引。预览不等于授权发布。

## 3. 进入审核

```bash
npm run content:status -- --kind blog --slug my-first-note --to review
```

审核内容的事实与来源、私人信息、代码示例、媒体权利和阅读体验。涉及命令行操作时，说明前提与后果；涉及推断时，明确指出不确定性。

## 4. 人工批准后改变状态

```bash
npm run content:status -- --kind blog --slug my-first-note --to published --approve
npm run content:check
npm run build
```

--approve 只能代表内容所有者已经针对当前内容给出批准。AI 不得自行推断批准，也不得绕过 review。实际部署或推送仓库是独立操作，需要单独确认。

## 允许与不允许的内容

| 支持 | 不支持 |
| --- | --- |
| 段落、标题、列表、表格 | 原始 HTML 或可执行 MDX |
| 普通代码块与行内代码 | JSX、import/export 和表达式 |
| HTTPS、站内链接与锚点 | javascript、data 与远程图片 |
| 经过检查的本地图片 | SVG、路径穿越或不存在的媒体 |

在本地查看所有状态，可以运行 npm run content:status。需要继续修改已公开内容时，先将它退回 review 或 draft，再完成检查与新的批准。
