export const site = {
  name: "qcm.dev",
  locale: "zh-CN",
  description: "关于 AI、工程与创造的开放笔记。一个持续生长的个人数字空间。",
  baseUrl: "https://qcm.dev",
};
export type AppEntry = {
  slug: string;
  name: string;
  title: string;
  domain: string;
  description: string;
  status: "planned";
  category: string;
  icon: "sparkles" | "workflow" | "panels";
  accent: string;
  details: string[];
};
export const apps: AppEntry[] = [
  {
    slug: "ai",
    name: "qcm AI",
    title: "AI 工作空间",
    domain: "ai.qcm.dev",
    description: "把日常灵感，变成可以实践的 AI 工作流。",
    status: "planned",
    category: "人工智能",
    icon: "sparkles",
    accent: "blue",
    details: [
      "预留独立 AI 应用入口",
      "后续接入模型与工作流前，单独评审数据和权限",
      "当前没有模型调用、账户或付费功能",
    ],
  },
  {
    slug: "agents",
    name: "Agents",
    title: "智能体实验室",
    domain: "agents.qcm.dev",
    description: "探索小而专注的智能体与自动化工具。",
    status: "planned",
    category: "实验项目",
    icon: "workflow",
    accent: "peach",
    details: [
      "概念阶段的子应用，是否开发仍待确认",
      "明确执行范围、审阅节点与运行日志",
      "当前没有运行中的智能体或自动化任务",
    ],
  },
  {
    slug: "admin",
    name: "Studio",
    title: "内容工作台",
    domain: "admin.qcm.dev",
    description: "未来用于整理内容、审核草稿和管理媒体。",
    status: "planned",
    category: "内容创作",
    icon: "panels",
    accent: "green",
    details: [
      "概念阶段的子应用，是否开发仍待确认",
      "首版使用仓库中的 Markdown 和本地命令审核",
      "当前没有后台、登录或远程发布能力",
    ],
  },
];
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
export const navItems = [
  { href: "/", label: "总览", icon: "home" },
  { href: "/blog/", label: "技术手记", icon: "book" },
  { href: "/docs/", label: "知识文档", icon: "files" },
  { href: "/apps/", label: "应用空间", icon: "grid" },
] as const;
