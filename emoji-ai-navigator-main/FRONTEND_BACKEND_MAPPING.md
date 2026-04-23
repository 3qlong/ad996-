# 前端改动 ↔ 后端管理映射检查

> 本次前端迭代涉及数据内容（子分类、详情富文本、点击排行）与 UI 结构。后端管理（`admin/`）与数据 API（`AI导航采集代码/`）是否支持同步？以下为逐项映射结论。

---

## 一、架构总览

```
emoji-ai-navigator-main/          前端（用户端 + 管理端）
├── src/                          用户端 React（端口 8080）
│   ├── data/tools.ts             ⚠️ 静态数据（离线备份）
│   └── services/clickTracking.ts 调用 /api/click，/api/hot-tools
├── admin/                        管理后台 React（端口 3001）
│   └── src/api/client.ts         调用 /admin/*（baseURL='/admin'）
└── vite.config.ts                proxy /api → 127.0.0.1:8001

AI导航采集代码/                   后端 Python（端口 8001，同仓外）
├── api_server.py                 用户端 API（/api/*）
├── admin_api.py                  管理端 API（/admin/*）
└── seed_admin.py                 初始化管理员账号
```

**关键事实**：前端显示数据有两条路径——
- **线上运行时**：通过 `/api/tools` 从后端 DB 读取（动态）
- **离线/静态回退**：`src/data/tools.ts`（24,364 行，1433 个站点）

前端页面 (`Index`, `HotIndexPage`, `MarketingNewsPage`, `ToolDetailPage`) 当前直接 `import { allTools } from '@/data/tools'`——**即生产环境实际读取的是 `tools.ts` 静态文件**，后端管理后台的编辑不会立即反映到用户端，除非重新导出 `tools.ts` 并重新构建。

---

## 二、改动对照表

| # | 前端改动 | 涉及文件 | 后端是否支持 | 映射状态 | 需后端同事做什么 |
|---|---|---|---|---|---|
| 1 | 移动端二级灰条 full-width | `HotIndexPage.tsx` / `MarketingNewsPage.tsx` / `Index.tsx` | 纯 UI 改动，无后端 | ✅ 不涉及 | 无 |
| 2 | Header 新增「AI榜单」入口 → `/hot-ranking` | `Header.tsx` | 路由 `HotRankingPage` 已存在 | ✅ 不涉及 | 无 |
| 3 | ToolDetailPage 右侧栏宽度 280px | `ToolDetailPage.tsx` | 纯 UI 改动 | ✅ 不涉及 | 无 |
| 4 | 「全部」页按点击热度排序 + 限 52 个 | `Index.tsx` + `services/clickTracking.ts` | 需 `GET /api/hot-tools`、`POST /api/click` | ⚠️ **依赖后端已部署** | 确认 `api_server.py` 提供 `/api/click`、`/api/hot-tools`、`/api/hot-categories` |
| 5 | 12 大类 × 2 子分类（共 24 个 sub-tag）体系 | `tools.ts` 的 `tags[]` 字段 | 后端 `tools` 表已有 `tags` 字段（见 `admin/ToolsPage.tsx:27,84,90-91`） | ⚠️ **数据不同步** | 需将 `tools.ts` 重新导入数据库，或反向：从 DB 导出覆盖 `tools.ts` |
| 6 | 62 个「热榜指数」站点富文本（productIntro / usageTips） | `tools.ts` 中 `details.productIntro`, `details.usageTips` | 后端 `tools` 表有 `product_intro`, `usage_tips` 字段（见 `ToolsPage.tsx:34-35,329-334`） | ⚠️ **数据不同步** | 同上，需要导入/导出同步 |
| 7 | 「AI办公…AI智能体」移动端分类条 | `Index.tsx` | 依赖 `categories` 表，admin 已有 `CategoriesPage` | ✅ 分类名称均已存在 | 无 |

---

## 三、数据字段一一映射

### `tools.ts`（前端静态）↔ 后端 `tools` 表

| 前端字段 (`src/data/tools.ts`) | 后端字段 (`admin/ToolsPage.tsx`) | 说明 |
|---|---|---|
| `id` | `id` | ✅ 一致 |
| `name` | `name` | ✅ |
| `emoji` | `emoji` | ✅ |
| `logo` | `logo` | ✅ |
| `url` | `url` | ✅ |
| `description` | `description` | ✅ |
| `tags: string[]` | `tags: string[]`（逗号分隔输入） | ✅ 本次子分类改动落在此字段 |
| `category` (string) | `category_id` + `category_name` | ⚠️ 前端存名称，后端存 ID。转换需要映射表 |
| `upvotes` | `upvotes` | ✅ |
| `details.productIntro` | `product_intro` | ✅ 本次富文本落地字段 |
| `details.usageTips` | `usage_tips` | ✅ 本次富文本落地字段 |
| `details.longDescription`（若有） | `long_description` | ✅ |
| —— | `sort_order` / `visible` / `awards` | 后端额外字段，前端未使用 |

### 点击排行 API

| 前端调用（`services/clickTracking.ts`） | 后端端点（需确认） |
|---|---|
| `POST /api/click` body `{tool_id, tool_name, category}` | `api_server.py` 待实现/已实现 |
| `GET /api/hot-tools?category=&days=7&limit=50` | 同上 |
| `GET /api/hot-categories?days=7` | 同上 |

---

## 四、数据同步建议（重点）

前端 `tools.ts` 本次由子代理大规模改动（1251 站点 tag 重分类 + 57 站点富文本），必须与 DB 对齐：

### 方案 A：以前端 `tools.ts` 为准（推荐）
1. 后端写一次性脚本读取 `src/data/tools.ts`
2. 按 `id` `UPSERT` 到 `tools` 表，更新 `tags`、`product_intro`、`usage_tips`
3. 注意 `category` 字段需 `name → id` 转换（从 `categories` 表查）

### 方案 B：以 DB 为准，反向导出 `tools.ts`
- `convert-tools.js`（仓库根目录已存在此脚本）可能就是做此事，需后端同事确认其功能

### 方案 C：切换前端到纯 API（中长期）
- 让 `Index.tsx` 等不再 `import allTools`，改为 `useQuery(getTools)`，最终废弃 `tools.ts`

---

## 五、风险清单

- **🔴 生产不一致**：若直接上线前端 `tools.ts` 而 DB 未同步，`/api/tools` 返回的仍是旧数据；但目前前端实际读静态文件，所以**只要重新构建并部署就生效**。未来若切到 API 读取，必须先完成数据库同步。
- **🟡 点击 API 依赖**：若 `/api/click`、`/api/hot-tools` 未部署，「全部」页首次打开会因 `fetchHotTools` 失败回退到 `upvotes` 排序（代码已容错），但热榜功能不生效。
- **🟡 分类 ID 映射**：前端用中文分类名，后端用 ID。若后端新增/重命名分类，需通知前端。
