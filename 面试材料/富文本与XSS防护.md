# 富文本与 XSS 防护

> CampusTech 核心深度故事：**用户可控 HTML 必须当不可信输入处理**。本项目采用「编辑 → 前端过滤 → 后端再过滤 → 安全渲染」多层防护。

## 1. 背景：为什么社区必须防 XSS？

- 帖子正文是 **HTML 字符串**，若直接 `dangerouslySetInnerHTML` 渲染，攻击者可注入 `<script>`、恶意 `img onerror`、钓鱼链接等。
- 富文本编辑器（TipTap）只保证「能编辑」，**不保证输出安全**；用户也可绕过编辑器直接调 API。
- 因此：**存储前过滤、展示前再过滤、前后端都要做**，任一层被绕过仍有下一层兜底。

## 2. 三层防护链路

```
用户编辑（TipTap）
    ↓ 输出 HTML
① 前端提交前：sanitizePostHtml（DOMPurify 白名单）
    ↓ POST /api/posts
② 后端入库前：sanitizePostContent（sanitize-html 白名单 + img 域校验）
    ↓ 存入 PostgreSQL
③ 前端展示：sanitizePostHtmlForDisplay → RichTextContent 渲染
```

| 层级 | 库 | 时机 | 文件 |
| --- | --- | --- | --- |
| ① 前端写入 | DOMPurify | 编辑器 onChange / 提交前 | `frontend/src/lib/sanitize-post-content.ts` |
| ② 后端存储 | sanitize-html | Service 层入库前 | `backend/src/common/utils/sanitize-post-content.ts` |
| ③ 前端展示 | DOMPurify + DOM 后处理 | `RichTextContent` 渲染前 | 同上 + `RichTextContent.tsx` |

## 3. 白名单策略

### 允许的标签

`p`, `h2`, `h3`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `a`, `img`, `br`

### 允许的属性

- 通用：`href`, `target`, `rel`, `src`, `alt`
- **禁止** `on*` 事件属性、`style`、任意 `data-*`（`ALLOW_DATA_ATTR: false`）

### 图片策略（重点）

**仅允许 `src` 以 `/uploads/` 开头**（本站上传目录）：

- 前端 DOMPurify hook：非 `/uploads/` 的 `src` 直接移除
- 后端 `exclusiveFilter`：外链 `img` 整标签丢弃

### 链接策略

- 后端 `allowedSchemes`：`http`, `https`, `mailto`（**不含 `javascript:`**）
- 展示时为 `<a>` 统一加 `target="_blank"` + `rel="noopener noreferrer"`

## 4. 攻击 Payload 对比

以下均为「若不做防护会发生什么」vs「本项目实际结果」。

### Payload 1：脚本注入

**输入**

```html
<p>正常段落</p><script>alert('xss')</script>
```

| 阶段 | 结果 |
| --- | --- |
| 未经防护 | 浏览器执行 `alert` |
| 前端 DOMPurify | `<script>` 标签被剥离，保留 `<p>正常段落</p>` |
| 后端 sanitize-html | 同上，双重保险 |
| 展示 | 用户只看到「正常段落」 |

Vitest 用例：`RichTextContent.test.tsx` → `过滤 script 标签`

---

### Payload 2：外链图片（追踪 / 恶意图床）

**输入**

```html
<img src="https://evil.com/track.png" alt="evil" />
```

| 阶段 | 结果 |
| --- | --- |
| 未经防护 | 加载外链图，可携带 Cookie 泄露、替换为钓鱼内容 |
| 前端 DOMPurify hook | `src` 被移除（或 img 无有效 src） |
| 后端 exclusiveFilter | 整段 `<img>` 被过滤，不入库 |
| 展示 | 不渲染外链图 |

Vitest 用例：`过滤非 /uploads/ 外链图片`

---

### Payload 3：`javascript:` 伪协议链接

**输入**

```html
<a href="javascript:alert(document.cookie)">点击领奖</a>
```

| 阶段 | 结果 |
| --- | --- |
| 未经防护 | 点击链接触发 JS |
| 后端 allowedSchemes | `javascript:` 不在白名单，`href` 被清除或标签处理 |
| 前端 DOMPurify | 默认禁止危险 URL scheme |
| 展示 | 链接不可执行脚本 |

---

### Payload 4：合法本站图片（应对照说明「什么能通过」）

**输入**

```html
<img src="/uploads/abc.png" alt="封面" />
```

| 阶段 | 结果 |
| --- | --- |
| 前端 + 后端 | 保留；展示时 `resolveAssetUrl` 补全为可访问 URL |
| 展示 | 正常显示图片 |

## 5. 面试 Q&A

### Q：只信前端过滤行不行？

**不行。** 攻击者可用 curl / Postman 直接 POST 恶意 HTML，绕过浏览器里的 TipTap 与 DOMPurify。后端必须在入库前消毒。

### Q：只信后端过滤行不行？

**不够。** 后端过滤保证「库里的数据相对干净」，但：
1. 历史脏数据、其他写入入口可能遗漏；
2. 展示层仍应做最后一道 DOMPurify，防止 CDN/中间人篡改响应；
3. 前端测试（Vitest）可在 CI 中回归 XSS 规则。

### Q：为什么 img 只允许 `/uploads/`？

- 防止用户把任意外链塞进帖子（图床追踪、违规内容、超大文件拖垮页面）。
- 与上传 API 配套：图片必须先走服务端上传，拿到受控路径再插入编辑器。

### Q：TipTap 本身安全吗？

TipTap 是编辑工具，不是安全边界。它输出的 HTML 结构相对规范，但**不能替代白名单过滤**。安全边界在 DOMPurify + sanitize-html。

### Q：评论正文怎么防？

评论若为纯文本则直接转义；若未来支持富文本，应复用同一套 sanitize 工具链，不要另写一套规则。

## 6. 演示建议（30 秒版）

1. 打开 `RichTextContent.test.tsx`，指出 script / 外链 img 用例。
2. 口述三层链路，强调「绕过编辑器直调 API 后端仍拦」。
3. （可选）在编辑器粘贴 `<script>alert(1)</script>`，提交后详情页无弹窗。
