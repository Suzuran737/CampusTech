# 前端 Demo 剧本（约 2 分钟）

> 适用：视频面试屏幕共享、现场笔记本演示。默认账号 `test` / `123456`（需本地已 seed 数据）。

**前置**：后端 `npm run start:dev`（3000）+ 前端 `npm run dev`（5173）。

| 步骤 | 时间 | 操作 | 讲解要点 |
| --- | --- | --- | --- |
| 1 | 0:00–0:25 | 打开 `/`，点「论坛帖子」，浏览列表；再点「技术资讯」 | TanStack Query 拉列表；Loading / Empty / Error 统一组件 |
| 2 | 0:25–0:40 | 未登录点「发帖」→ 跳转登录；用 test 账号登录 | JWT + `ProtectedRoute`；`state.from` 登录后回跳 |
| 3 | 0:40–1:10 | 进入 `/posts/new`，输入标题，TipTap 写正文（加粗/列表），可选上传封面，发布 | TipTap 懒加载；提交前 DOMPurify；FormData 封面上传 |
| 4 | 1:10–1:35 | 进入刚发的帖子详情，发一条评论并回复子评论 | 两层评论 UI；`['comments', postId]` Query |
| 5 | 1:35–1:50 | 打开 `/profile?tab=posts` 看「我的帖子」 | Tab 深链；`['posts', 'mine', userId, page]` |
| 6 | 1:50–2:00 | （可选）帖子列表搜索关键词，观察 debounce | `useDebounce` 300ms，减少 API 频率 |

---

## 逐步详解

### 步骤 1：公开浏览（25s）

1. 访问 http://localhost:5173
2. 导航 → **论坛帖子** `/posts`
3. 指出：分类筛选、分页、PostCard 布局
4. 切换 **技术资讯** `/articles` — 另一套 Query 键，说明多数据源共用 Query 模式

**一句话**：服务端状态都走 TanStack Query，三态 UI 统一。

---

### 步骤 2：登录与路由守卫（15s）

1. 点击 **发帖** → 应跳转 `/login`
2. 登录 `test` / `123456`
3. 登录成功后回到发帖或首页

**一句话**：`ProtectedRoute` 读 Context 里的 JWT；未登录带 `from` 跳转。

---

### 步骤 3：富文本发帖（30s）

1. 进入 **发帖** `/posts/new`
2. 短暂出现「编辑器加载中...」→ TipTap 工具栏（可强调 lazy chunk）
3. 填写标题、正文（演示加粗/二级标题）
4. 点击发布 → 跳转详情

**一句话**：编辑器独立 chunk；HTML 经前后端双重 sanitize 才入库（详见《富文本与XSS防护》）。

---

### 步骤 4：评论互动（25s）

1. 在详情页底部写评论并提交
2. 点击某条评论的 **回复**，发子评论
3. 展示两层缩进结构

**一句话**：评论树前端组装；Query 刷新列表。

---

### 步骤 5：个人中心 Tab（15s）

1. 导航 → **个人中心** `/profile`
2. 切换 **我的帖子** Tab（URL 变为 `?tab=posts`）
3. 看到刚发布的帖子，可点编辑

**一句话**：Tab 与 URL 同步，方便分享深链；Query 按 `authorId` 筛自己的帖子。

---

### 步骤 6（可选）：搜索 debounce（10s）

1. 回到 `/posts`
2. 搜索框输入关键词，停顿 300ms 后列表更新
3. 清空搜索恢复列表

**一句话**：输入态 local state，debounce 后再触发 Query。

---

## 备用演示点（面试官追问时）

| 话题 | 操作 |
| --- | --- |
| 404 | 访问 `/xyz` 看 NotFoundPage |
| 非作者编辑 | 打开他人帖子 `/posts/:id/edit` → 重定向详情 + 提示 |
| 性能 | DevTools Network：列表页无 PostEditor chunk |
| 测试 | `cd frontend && npm run test:run` 展示 XSS 用例通过 |
| 移动端 | DevTools 375px 看汉堡菜单与个人中心 |

---

## 常见翻车与应对

| 情况 | 处理 |
| --- | --- |
| 列表为空 | 先登录发一条帖，或用搜索确认有 seed 数据 |
| 登录失败 | 确认后端已启动；检查数据库是否有 test 用户 |
| 编辑器一直 loading | 硬刷新；看控制台是否 chunk 404 |
| 评论发不出 | 确认已登录且 token 未过期 |

---

## 演示检查清单（演示前 1 分钟）

- [ ] 后端 http://localhost:3000/api 可访问
- [ ] 前端 http://localhost:5173 可访问
- [ ] test 账号可登录
- [ ] 至少 1 条帖子存在（便于详情/评论演示）
- [ ] 浏览器缩放 100%，关闭无关标签页
