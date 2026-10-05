# qcm.dev · 设计与信息结构

## 视觉计划

主站是一张安静的开发者工作桌：固定的磨砂侧栏、独立的胶囊工具栏、可直接阅读的内容和应用入口。参考图的层次与材质用于空间组织，而非复制智能家居的控件、假统计或图表。

- Canvas / 雾蓝 `#edf0f7`
- Panel / 玻璃白 `#f7f9fd`
- Ink / 石墨蓝 `#253048`
- Muted / 次要文字 `#5d6881`
- Action / 钴蓝 `#3e56cf`
- Soft accent / 微光青 `#dcece8`
- Manrope Variable 用于英文和数字；系统中文无衬线字体用于中文。代码使用系统等宽字体
- 主体 16px；常用界面标签 14px；补充元数据 12–13px；阅读宽度不超过 75ch
- 侧栏 222px；主栅格 2:1；首屏直接呈现精选内容、真实内容数量；应用卡片和文章列表是实际链接
- 大容器 24px、工具栏 99px、正文面板 24px；用不同圆角标记层级

## 简化后的方向

取消纯营销型整屏 hero、没有来源的统计图和每张卡片的循环动画。保留一张原创钴蓝玻璃带图像作为记忆点；其余区域安静可读。数量来自仓库内已发布示例文章。子域名是规划，不暗示已经有服务或后台。

桌面：侧栏 | 工具栏 / 2:1 精选与概览 / 三列应用 / 手记与文档。
手机：紧凑工具栏 + 可关闭导航；内容单列；过滤器换行；阅读目录可折叠布局。

## 参考来源与边界

- [Streamxy — HALO LAB](https://dribbble.com/shots/25039066-UI-UX-for-a-Management-SaaS-Streamxy)：浅色磨砂侧栏、胶囊工具栏、清晰表格信息密度
- [Casado — HALO LAB](https://dribbble.com/shots/24884136-UI-UX-for-a-Management-SaaS-Casado)：异形栅格、蓝紫灰玻璃、柔和高光
- [Smart Home Glassmorphism — Stim](https://dribbble.com/shots/26339637-Smart-Home-Dashboard-Glassmorphism-UI)：半透明层次、冷色操作态
- [Smart Home Monitoring — Orphis Studio](https://dribbble.com/shots/25904071-Smart-Home-Monitoring-Dashboard)：主次模块比例与空间感

四份原始参考图均实际查看；未复制其中的图像、照片、头像、标志或图表进此项目。hero 为本项目新生成图像，经 WebP 优化后本地托管。参考只是静态概念，并不代表其有完整交互或移动端实现。

## UI 库选择

- 选用 Radix 的 Dialog、ToggleGroup、Slot；用轻量自有包装组件保持 shadcn 风格的可组合 API。Radix 负责焦点、键盘和可访问行为。已研究 shadcn 官方文档并尝试 CLI，但当前环境访问其 registry 失败；首版没有冒充成功安装的 shadcn 源文件
- Lucide 用于一致的细线图标
- Magic UI 已研究，首版不引入额外的 marquee / particle / magic-card 效果，避免喧宾夺主
- Motion 已研究，首版 CSS 状态过渡足够，不引入不必要运行时依赖
- Markdown 使用 unified / remark / rehype 的清洗管线，未启用可执行 MDX

中文优先；所有可见文案集中在页面与少量配置中，可后续抽取字典。当前不声明已实现双语切换。
