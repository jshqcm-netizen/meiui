# GitHub Pages 公开预览

目标地址：https://jshqcm-netizen.github.io/meiui/ 。无需自定义域名或 DNS。

首次启用：仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
设置入口：https://github.com/jshqcm-netizen/meiui/settings/pages 。需要仓库管理员操作。
随后在 Actions → Deploy site to GitHub Pages → Run workflow，或重新运行此前失败的发布任务。

推送 main 会运行内容校验、TypeScript、ESLint、单元测试、静态构建和导出链接检查；全部通过才上传 out/ 并部署。
使用 GitHub 内建临时 GITHUB_TOKEN 和官方 Pages Actions，不需要手工创建 token。

本地复现：

```sh
npm ci
NEXT_PUBLIC_BASE_PATH=/meiui NEXT_PUBLIC_SITE_URL=https://jshqcm-netizen.github.io/meiui npm run check
NEXT_PUBLIC_BASE_PATH=/meiui npm run check:export
NEXT_PUBLIC_BASE_PATH=/meiui npm run preview
# http://127.0.0.1:3000/meiui/
```

默认本地开发仍在根路径；Next Link/router 自动处理 basePath，原生图片、视频、字幕、图标及 Markdown 链接另行加前缀。
保留 noindex、nofollow 与 robots.txt 的 Disallow: /。这不是访问控制：上线内容仍然公开可读。
项目级 robots.txt 位于 /meiui/robots.txt；搜索引擎通常只读取域名根 robots.txt，因此页面 noindex 仍是本预览的主要索引提示。
GitHub Pages 不支持本项目配置任意生产响应头；本地预览服务器头不等于线上头。
无需后台、账户或数据库；当前示例内容及规划中应用保持原状。
