# ad996 · 广告导航站（源码仓库）

本仓库为 **[ad996.com](https://ad996.com)** 导航站点的**唯一公开源码**：React 前端 + Python（FastAPI）主站与统计后台 + 部署脚本。  
详细部署、端口、Nginx、HTTPS 与更新流程见根目录 **[`DEPLOY.md`](DEPLOY.md)**。

> 仓库根目录即为同步到服务器的 **`/opt/ai-navigation`** 的内容（不再套一层 `AI导航/`）。若你还在 **picTent 主仓**里开发，对应目录仍是 `AI导航/`，部署命令见 `DEPLOY.md` 里的「双路径」说明。

---

## Git 提交显示的名字不对？

GitHub 上显示的提交者，来自你执行 `git commit` 那台电脑上的配置：

```bash
git config --global user.name "你的名字或组织常用名"
git config --global user.email "你的邮箱@example.com"
```

在**本仓库目录**也可以只改本仓库（不写 global）：

```bash
cd ad996
git config user.name "welovesuzhou"
git config user.email "你的邮箱@example.com"
```

与 Cursor 绑定的 GitHub 账号若自动带了 `-ship-it` 后缀，把这里改成你希望显示的身份即可；**不需要**也通常**不能**在 GitHub 上「合并」两个用户账号。

---

## 仓库里有什么

| 路径 | 说明 |
|------|------|
| `emoji-ai-navigator-main/` | React（Vite）前端；生产静态资源在 `dist/`（改 UI 后需 `npm run build` 再提交/同步） |
| `AI导航采集代码/` | Python：`api_server.py`、`admin_api.py`、数据与爬虫脚本 |
| `deploy/` | `sync-to-server.sh`、`bootstrap-server.sh`、systemd / Nginx 示例 |

**不提交的内容**（见根目录 `.gitignore`）：`node_modules/`、`venv/`、`admin.db`、`uploads/` 等。

**关于中文文件夹名 `AI导航采集代码/`**：在 macOS / Linux / 现代 Windows（UTF-8）下开发与部署**没有问题**；少数老旧脚本若硬编码 ASCII 路径可能踩坑，本仓库脚本与 systemd 已按当前路径验证。

---

## 同事第一次拿到代码（本地）

需已安装 [Git](https://git-scm.com/) 与 [Node.js](https://nodejs.org/) LTS。

```bash
git clone https://github.com/welovesuzhou/ad996.git
cd ad996
cd emoji-ai-navigator-main
npm install
npm run dev
```

浏览器打开终端里提示的地址（一般为 `http://localhost:8080`）。

---

## 更新上线（有服务器与 SSH 密钥时）

见 **[`DEPLOY.md`](DEPLOY.md)**。

极简（在**本仓库根目录** `ad996/`）：

```bash
cd emoji-ai-navigator-main && npm run build && cd ..
bash deploy/sync-to-server.sh
```

首次装机：

```bash
bash deploy/bootstrap-server.sh
```

---

## 许可证

根目录 `LICENSE` 为 MIT。业务数据与线上密钥勿提交本仓库。

---

## 给同事的「复制粘贴」说明（发微信群 / 飞书）

```
我们 ad996 导航站的代码： https://github.com/welovesuzhou/ad996

第一次用：
1）装好 Git 和 Node.js（LTS）
2）终端执行：
   git clone https://github.com/welovesuzhou/ad996.git
   cd ad996/emoji-ai-navigator-main
   npm install
   npm run dev
3）浏览器打开终端里显示的地址（一般是 8080）

以后更新代码：
   cd ad996
   git pull
   cd emoji-ai-navigator-main
   npm install
   npm run dev

上线到 ad996.com（要 SSH 密钥）：
   看仓库根目录的 DEPLOY.md
```
