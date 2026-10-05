# 第二版迭代记录

基线：GitHub main `950446b3e2de94edbe0c13f62968b9cff40333cd`。开始前核对远端与本地全部 75 个源码文件，未发现并发修改。每个独立增量完成检查后单独提交，避免大批量混合变更。

## 1. 可重复的界面验收

新增 Playwright 配置与回归用例，覆盖桌面、平板、手机的布局溢出、搜索空状态/重新打开、主题筛选、历史返回、目录锚点、原生视频和移动导航；运行时保存真实截图到被 Git 忽略的 `qa/`。

```bash
npm ci
npx playwright install chromium
npm run test:ui
# 只检查测试发现/配置，不启动浏览器：
npm run test:ui:list
```

如果本机已有 Chromium，可通过 `QCM_CHROMIUM_PATH` 指向实际可执行文件。测试框架启动本机静态预览，不部署、不穿透、不建立公开链接。不要用测试设置绕过环境或浏览器限制。

当前云浏览器仍返回 `ERR_BLOCKED_BY_CLIENT`，阻止本地地址。因此 `test:ui:list` 的成功只代表用例可加载，不代表截图或交互验收通过。首版已记录的 Chromium socket 限制也仍属于验证边界。

shadcn registry 的连接配置问题已排除，官方 CLI 文档查询恢复。接下来的组件改动使用官方 registry，并审查实际新增源码，不再声称尝试安装等同于成功。
