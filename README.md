# ad996 · 广告导航站（源码仓库）

本仓库为 **[ad996.com](https://ad996.com)** 导航站点的**唯一公开源码**：React 前端 + Python（FastAPI）主站与统计后台 + 部署脚本。  
详细部署、端口、Nginx、HTTPS 与更新流程见：**[`AI导航/DEPLOY.md`](AI导航/DEPLOY.md)**。

> 本仓库与 picTent 主仓中的 `AI导航/` 目录内容对齐，便于单独协作与发版；线上服务器目录一般为 `/opt/ai-navigation`。

---

## 仓库里有什么

| 路径 | 说明 |
|------|------|
| `AI导航/emoji-ai-navigator-main/` | React（Vite）前端源码；生产静态资源在 `dist/`（已纳入仓库，可直接按文档同步上线；改 UI 后需本地 `npm run build` 再提交） |
| `AI导航/AI导航采集代码/` | Python：`api_server.py`（主站+搜索+图标代理）、`admin_api.py`（点击/热榜）、爬虫与数据脚本 |
| `AI导航/deploy/` | `sync-to-server.sh`、`bootstrap-server.sh`、systemd / Nginx 示例 |

**不提交的内容**（见 `AI导航/.gitignore`）：`node_modules/`、`venv/`、`admin.db`、`uploads/` 等。

---

## 同事第一次拿到代码（本地）

在终端执行（需已安装 [Git](https://git-scm.com/) 与 [Node.js](https://nodejs.org/) LTS）：

```bash
git clone https://github.com/welovesuzhou/ad996.git
cd ad996
cd AI导航/emoji-ai-navigator-main
npm install
npm run dev
```

浏览器打开提示的地址（一般为 `http://localhost:8080`）。  
若要改完页面上线，见下节「更新上线」。

---

## 更新上线（已有服务器与密钥时）

**必读**：[`AI导航/DEPLOY.md`](AI导航/DEPLOY.md)。

极简版（在本机、仓库根目录 `ad996/` 下）：

```bash
# 若改了前端页面，先构建再同步
cd AI导航/emoji-ai-navigator-main && npm run build && cd ../..
bash AI导航/deploy/sync-to-server.sh
```

首次装机或 systemd/Nginx 未配置时，再执行一次：

```bash
bash AI导航/deploy/bootstrap-server.sh
```

（在**服务器**上、且代码已在 `/opt/ai-navigation` 时执行；详见 `DEPLOY.md`。）

---

## 许可证

根目录 `LICENSE` 为 MIT（与历史提交一致）。业务数据与线上密钥勿提交本仓库。

---

## 给同事的「复制粘贴」说明（发微信群 / 飞书）

把下面整段发给同事即可：

```
我们 ad996 导航站的代码在 GitHub： https://github.com/welovesuzhou/ad996

你第一次拉代码：
1）电脑装好 Git 和 Node.js（官网下 LTS 版即可）
2）终端执行：
   git clone https://github.com/welovesuzhou/ad996.git
   cd ad996/AI导航/emoji-ai-navigator-main
   npm install
   npm run dev
3）浏览器打开终端里显示的本地地址（一般是 8080），能打开页面就对了。

以后有人改了代码并已推到 GitHub，你本地更新：
   cd ad996
   git pull
   cd AI导航/emoji-ai-navigator-main
   npm install
   npm run dev

若要发布到线上 ad996.com（需要运维给的 SSH 密钥，一般人不用做）：
   看仓库里的 AI导航/DEPLOY.md，按文档执行 build + sync 脚本。
```
