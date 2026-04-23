# 部署指南（后端同事）

> 本项目由 **3 个子系统** 组成：用户端前端、管理端前端、Python API 后端。生产部署需要将三者分别构建并通过反向代理整合。

---

## 一、系统架构

```
                ┌────────────────────┐
  用户浏览器 →  │  Nginx / CDN       │
                │  (80 / 443)        │
                └─────────┬──────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
  /  (静态)          /admin-ui  (静态)    /api/*、/admin/* 反代
  用户端 dist/        admin/dist/          → Python 后端 :8001
```

| 子系统 | 目录 | 端口（开发） | 产物 | 访问路径 |
|---|---|---|---|---|
| 用户端前端 | `emoji-ai-navigator-main/` | 8080 | `dist/` | `/` |
| 管理端前端 | `emoji-ai-navigator-main/admin/` | 3001 | `admin/dist/` | `/admin-ui/`（建议） |
| 后端 API | `AI导航采集代码/`（同仓外） | 8001 | Python 进程 | `/api/*`、`/admin/*`、`/uploads/*` |

---

## 二、环境依赖

- **Node.js** ≥ 18（推荐用 [nvm](https://github.com/nvm-sh/nvm)）
- **npm** ≥ 9
- **Python** ≥ 3.10
- **Nginx**（或其他反向代理）
- 可选：**pm2** / **systemd** 做进程守护

---

## 三、本地开发启动

```bash
# 1) 后端 API（必须最先启动）
cd "../AI导航采集代码"
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # 若存在
python3 seed_admin.py             # 首次初始化管理员账号（仅一次）
python3 api_server.py             # 用户端 API，默认 0.0.0.0:8001
# 如管理端 API 分离，另起：python3 admin_api.py

# 2) 用户端前端
cd "../emoji-ai-navigator-main"
npm install
npm run dev                       # http://localhost:8080

# 3) 管理端前端（新终端）
cd admin
npm install
npm run dev                       # http://localhost:3001
```

开发环境 Vite 已配置代理（见 `vite.config.ts`、`admin/vite.config.ts`）：
- 用户端 `/api/*` → `127.0.0.1:8001`
- 管理端 `/admin/*` 和 `/uploads/*` → `127.0.0.1:8001`

根 `package.json` 也提供了便捷脚本：
```bash
npm run start-api         # 启动用户端 API
npm run start-admin-api   # seed + 启动管理端 API
npm run admin             # 启动管理端前端 dev server
```

---

## 四、生产构建

```bash
# 用户端
cd emoji-ai-navigator-main
npm ci
npm run build              # 输出到 dist/

# 管理端
cd admin
npm ci
npm run build              # 输出到 admin/dist/
```

> 如果管理端不挂在根路径（而是 `/admin-ui/`），需在 `admin/vite.config.ts` 里加 `base: '/admin-ui/'` 再构建。

---

## 五、Nginx 示例配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 用户端
    root /var/www/ai-nav/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 管理端（静态）
    location /admin-ui/ {
        alias /var/www/ai-nav/admin-dist/;
        try_files $uri $uri/ /admin-ui/index.html;
    }

    # 用户端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 管理端 API
    location /admin/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:8001;
    }
}
```

---

## 六、后端进程守护（systemd 示例）

`/etc/systemd/system/ai-nav-api.service`：
```ini
[Unit]
Description=AI Navigator API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/ai-nav-backend
ExecStart=/opt/ai-nav-backend/.venv/bin/python api_server.py
Restart=on-failure
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now ai-nav-api
sudo systemctl status ai-nav-api
```

---

## 七、数据同步（重要）

前端 `src/data/tools.ts` 本轮大规模更新（1251 站点重新分类 + 57 个热榜指数站点补充富文本）。上线前请完成以下任一步骤：

### 选项 A：前端静态文件作为数据源（当前实际方案）
无需后端改动，直接：
```bash
cd emoji-ai-navigator-main && npm run build
# 将 dist/ 部署到 Nginx root
```
**注意**：此方案下后台管理修改不会立即反映到用户端（需重新从 DB 导出 `tools.ts` 并重新构建）。

### 选项 B：数据库同步（推荐长期）
让后端脚本读取 `src/data/tools.ts`，按 `id` UPSERT 到 `tools` 表：

```python
# sync_tools_from_frontend.py（后端同事编写）
import json, re
from pathlib import Path

# 1. 解析 TS 文件提取 allTools 数组
# 2. 对每条记录：
#    UPDATE tools SET
#      tags = %s,
#      product_intro = %s,
#      usage_tips = %s,
#      long_description = %s
#    WHERE id = %s
```

详见 `FRONTEND_BACKEND_MAPPING.md` 第四节方案 A。

---

## 八、接口契约（后端需实现/确认）

### 用户端（`/api/*`）

| Method | Path | 请求 | 响应 | 说明 |
|---|---|---|---|---|
| POST | `/api/click` | `{tool_id, tool_name, category}` | `200 OK` | 记录点击（每 IP 每日每工具一次） |
| GET | `/api/hot-tools` | `?category=&days=7&limit=50` | `{items: [{tool_id, tool_name, category, clicks}]}` | 热门工具榜 |
| GET | `/api/hot-categories` | `?days=7` | `[{category, clicks}]` | 热门分类 |
| GET | `/api/tools` | —— | `[Tool]` | （可选）替代静态 `tools.ts` |

### 管理端（`/admin/*`）

详见 `admin/src/api/client.ts`，已实现（需后端对应）：
- `/admin/dashboard`
- `/admin/categories` CRUD + `/sort`
- `/admin/tools` CRUD + `/sort` + `/batch-delete` + `/batch-move`
- `/admin/nav-sites` CRUD + `/sort`
- `/admin/submissions` + `/review`
- `/admin/users` CRUD
- `/admin/calendar-events` CRUD
- `/admin/business-inquiries` + `/status`
- `/admin/recommended-tools` CRUD + `/sort`
- `/admin/upload`（multipart/form-data）

---

## 九、环境变量

当前代码未使用 `.env`，API 地址硬编码在 `vite.config.ts`。生产部署通过 Nginx 反代，**无需修改前端代码**。

若后端服务地址变动，仅需修改 Nginx `proxy_pass`。

---

## 十、上线前自检清单

- [ ] 后端 `api_server.py` 已启动，`curl http://127.0.0.1:8001/api/tools` 可返回数据
- [ ] `/api/click`, `/api/hot-tools`, `/api/hot-categories` 三个端点存在（本次热榜功能依赖）
- [ ] `admin/dist/` 和 `dist/` 已生成
- [ ] Nginx 代理规则已生效（浏览器访问 `/api/` 不返回 404）
- [ ] 管理端首次登录用 `seed_admin.py` 创建的账号
- [ ] `tools.ts` 与数据库数据已对齐（见第七节）
- [ ] HTTPS 证书已配置（Let's Encrypt / 云厂商）

---

## 十一、常见问题

**Q：前端改了 `tools.ts` 后台是否自动更新？**
A：不会。前端 `tools.ts` 是静态导入，与后端 DB 互相独立。需要显式同步（第七节）。

**Q：管理端登录不上？**
A：检查是否运行过 `seed_admin.py`，以及 `/admin/*` 代理是否生效。

**Q：点击热榜没数据？**
A：检查 `/api/click` 是否返回 200，以及后端是否按天去重（每 IP/日/工具一次）。前端会静默失败，热榜为空时按 `upvotes` 排序。

**Q：图片上传 404？**
A：确认 Nginx 加了 `/uploads/` 代理规则。
