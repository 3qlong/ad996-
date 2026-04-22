# ad996 · 广告导航站（源码仓库）

本仓库为 **[ad996.com](https://ad996.com)** 导航站点的**唯一公开源码**：React 前端 + Python（FastAPI）主站与统计后台 + 部署脚本。  
详细部署、端口、Nginx、HTTPS 与更新流程见根目录 **[`DEPLOY.md`](DEPLOY.md)**。

> 仓库根目录与线上 **`/opt/ai-navigation`** 同构。若你在 **picTent 主仓**开发，对应目录为 `AI导航/`，命令路径见 **`DEPLOY.md`** 里的「双路径」表。

---

## 推荐协作流程（负责人 + 同事）

**分工：同事改代码并推到 GitHub → 负责人拉取最新 → 部署上云。**

这套流程**合理、常见**，适合小团队：Git 做版本真相，负责人把关门禁与线上发布。

| 环节 | 建议 |
|------|------|
| **同事** | 在 `main` 或约定好的功能分支开发；`git pull` 后再改，减少冲突；**改完自测**（`npm run dev`）；`git push` 前确认未提交密钥、`.env`、`node_modules`。 |
| **改前端页面** | 提交前在本机执行 **`npm run build`**，把生成的 **`emoji-ai-navigator-main/dist/`** 一并提交，这样负责人部署时不必再替你 build（也避免「只提交了源码、线上样式还是旧的」）。若你们约定由负责人统一 build，则同事可不提交 `dist`，但必须在 PR/说明里写清楚「需要 build」。 |
| **负责人（你）** | `git pull` 后快速浏览本次变更；若含前端改动且同事未提交 `dist`，在发版前 **`cd emoji-ai-navigator-main && npm run build`**；再执行 **`bash deploy/sync-to-server.sh`**（需本机已配置 SSH 密钥，见 `DEPLOY.md`）。 |
| **再大一点团队** | 可改为：同事提 **Pull Request** → 你 Review 通过后再合并 → 你再部署；需要时再加简单 CI（lint / build）自动检查。 |

**不要提交**：服务器上的 `admin.db`、任何口令密钥、同事本机 `node_modules/`（已在 `.gitignore`）。

---

## Git 提交显示的名字不对？

GitHub 上的作者来自执行 `git commit` 那台机器的配置：

```bash
git config --global user.name "你的名字或组织常用名"
git config --global user.email "你的邮箱@example.com"
```

仅本仓库：

```bash
cd ad996
git config user.name "welovesuzhou"
git config user.email "你的邮箱@example.com"
```

---

## 仓库里有什么

| 路径 | 说明 |
|------|------|
| `emoji-ai-navigator-main/` | React（Vite）前端；生产静态资源在 `dist/` |
| `AI导航采集代码/` | Python：`api_server.py`、`admin_api.py`、数据与爬虫脚本 |
| `deploy/` | `sync-to-server.sh`、`bootstrap-server.sh`、systemd / Nginx 示例 |

**不提交**（见根目录 `.gitignore`）：`node_modules/`、`venv/`、`admin.db`、`uploads/` 等。

**关于中文目录名 `AI导航采集代码/`**：在 macOS / Linux / 现代 Windows（UTF-8）下**一般无影响**；本仓库脚本与 systemd 已按当前路径编写。

---

## 同事第一次拿到代码（本地）

需 [Git](https://git-scm.com/) 与 [Node.js](https://nodejs.org/) LTS。

```bash
git clone https://github.com/welovesuzhou/ad996.git
cd ad996
cd emoji-ai-navigator-main
npm install
npm run dev
```

浏览器打开终端里提示的地址（一般为 `http://localhost:8080`）。

---

## 负责人：拉代码后部署上云（极简）

见 **[`DEPLOY.md`](DEPLOY.md)**。在**本仓库根目录**：

```bash
git pull
# 若本次含前端改动且 dist 未更新：
cd emoji-ai-navigator-main && npm run build && cd ..
bash deploy/sync-to-server.sh
```

首次装机才需要：`bash deploy/bootstrap-server.sh`（见 `DEPLOY.md`）。

---

## 许可证

根目录 `LICENSE` 为 MIT。业务数据与线上密钥勿提交本仓库。

---

## 给同事的「复制粘贴」说明（发微信群 / 飞书）

```
【仓库】https://github.com/welovesuzhou/ad996

【你的分工】
你负责改代码并推到 GitHub；我负责拉最新代码并部署到 ad996.com。

【你每次改完要做什么】
1）在本机自测：cd ad996/emoji-ai-navigator-main → npm install（第一次）→ npm run dev，浏览器能正常打开页面。
2）若改了前端页面/样式：在同一目录执行 npm run build，确保 dist 有更新；把 dist 一起 git add 提交（我们约定由我统一 build 的话再跟我说）。
3）不要提交 node_modules、密码、.env、服务器上的数据库文件。
4）提交并推送：
   git add -A
   git status   （看一眼有没有不该提交的文件）
   git commit -m "一句话说明改了什么"
   git push

【我这边会做什么】
你 push 之后告诉我一声（或发 PR）；我 git pull 后按 DEPLOY.md 同步到服务器。

【你本地更新别人已推的代码】
   cd ad996 && git pull
   cd emoji-ai-navigator-main && npm install && npm run dev
```
