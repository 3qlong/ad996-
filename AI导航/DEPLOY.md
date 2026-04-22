# AI 导航站（ad996.com）部署与更新说明

本文档为 **AI导航** 子项目的唯一权威运维说明（与 picTent 主仓 `deploy/` 并列；编排见 `.claude/skills/pictent-deploy/SKILL.md`）。

> **协作源码（GitHub）**：[welovesuzhou/ad996](https://github.com/welovesuzhou/ad996) — 仓库内 `AI导航/` 与本目录内容对齐，便于同事单独克隆与发版；协作说明见该仓库根目录 `README.md`。

> **生产入口**：**`https://ad996.com`**。与 picTent（eyer.tv）同机时，两套目录、两套 systemd、Nginx 按 `server_name` 分流。

---

## 1. 架构（双进程 + Nginx）

| 服务 | systemd 单元 | 监听 | 职责 |
|------|----------------|------|------|
| 主站 | `ai-navigation-api` | `127.0.0.1:8096` | `api_server.py`：挂载 **`emoji-ai-navigator-main/dist/`**（React SPA）、`/health`、`/search`、`/icon-proxy` 等 |
| 统计 / 管理 API | `ai-navigation-admin-api` | `127.0.0.1:8001` | `admin_api.py`：SQLite **`admin.db`**，实现 **`/api/click`**、**`/api/hot-tools`**、**`/api/hot-categories`**（点击与热榜闭环） |

**Nginx**（`deploy/nginx/ai-navigation.conf` 与生产 HTTPS 示例）将：

- **`/api/click`**、**`/api/hot-tools`**、**`/api/hot-categories`** → **8001**
- **其余路径** → **8096**

因此前端在 **https://ad996.com** 同源请求 `/api/*` 时，由 Nginx 分流到 admin_api，**不再**在 `api_server` 内做存根。

端口速查：`AI导航/.claude/ports.json`。

---

## 2. 发布内容是否「最新」

1. **前端**：以 **`emoji-ai-navigator-main/dist/`** 为准；改 UI 须 **`cd emoji-ai-navigator-main && npm run build`** 后再 **`bash AI导航/deploy/sync-to-server.sh`**。
2. **主服务代码**：`AI导航采集代码/api_server.py` 等同理随 rsync 更新并重启 `ai-navigation-api`。
3. **统计库**：`admin.db` 在服务器生成，**勿**用 rsync `--delete` 覆盖线上库；已加入 **`AI导航/.gitignore`**。

---

## 3. 首次部署

1. 服务器：`sudo mkdir -p /opt/ai-navigation && sudo chown $USER:$USER /opt/ai-navigation`（若尚无）。
2. 本机：`bash AI导航/deploy/sync-to-server.sh`
3. 本机：`bash AI导航/deploy/bootstrap-server.sh`（安装 venv、**两个** systemd、Nginx 模板）。
4. 若缺 venv：`sudo apt install -y python3.12-venv`
5. pip 慢：`/opt/ai-navigation/venv/bin/pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/ -r .../requirements.txt`
6. **首次初始化 admin 库（可选）**：在服务器 `AI导航采集代码/` 下执行 `python3 seed_admin.py`（生成分类等种子数据；**不**替代前台工具列表，工具数据仍以 React `src/data/tools.ts` 构建进 dist 为主）。

### 3.1 HTTPS（生产）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ad996.com -d www.ad996.com
```

或参考 **`deploy/nginx/ai-navigation.production.conf.example`** 手工维护 443；合并时注意保留 **`/api/*` → 8001** 与 **`/` → 8096** 的分流。

---

## 4. 日常更新

```bash
bash AI导航/deploy/sync-to-server.sh
```

会：`rsync` 整个 `AI导航/`（已排除 `node_modules`、`venv` 等）→ 远程 `pip install -r requirements.txt` → **`systemctl restart ai-navigation-api ai-navigation-admin-api`**（若已 enable）。

与 picTent 同发：`bash deploy/scripts/sync-pictent-and-ai-nav-cloud.sh`。

---

## 5. 变更速查

| 改动 | 操作 |
|------|------|
| React 页面 | `emoji-ai-navigator-main` 内改 → `npm run build` → `sync-to-server.sh` |
| `api_server.py` / `admin_api.py` / `requirements.txt` | 改后 `sync-to-server.sh` |
| `ai_navigation.json` | 本地生成后同步；或 `python3 build_ai_navigation_json.py` |
| 改 Nginx | 改仓库模板后拷到服务器 `sites-available`，`nginx -t && reload` |
| 改 **8096** / **8001** | 同步改对应 **`deploy/systemd/*.service`**，`daemon-reload` + `restart` |

---

## 6. 验收

```bash
# 服务器本机
curl -sS http://127.0.0.1:8096/health
curl -sS "http://127.0.0.1:8001/api/hot-tools?limit=3"

# 公网（HTTPS）
curl -sfS https://ad996.com/health
curl -sfS "https://ad996.com/api/hot-tools?limit=3"
```

---

## 7. 图标 `/icon-proxy`

仅服务端代理 **`*.ai-bot.cn`**；勿让服务器代拉 Google（易 502）。详见此前实现与 `api_server.py` 白名单。

---

## 8. 仓库索引

| 路径 | 说明 |
|------|------|
| `deploy/sync-to-server.sh` | 同步 + pip + 重启 **双** systemd |
| `deploy/bootstrap-server.sh` | 首次：venv + **双** systemd + Nginx |
| `deploy/systemd/ai-navigation-api.service` | 8096 |
| `deploy/systemd/ai-navigation-admin-api.service` | 8001 |
| `deploy/nginx/ai-navigation.conf` | HTTP + **API 分流** |
| `deploy/nginx/ai-navigation.production.conf.example` | HTTPS 示例 + 同上分流 |
| `emoji-ai-navigator-main/README.md` | 前端开发与 build 说明 |
