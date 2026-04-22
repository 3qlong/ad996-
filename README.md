# ad996 · 广告导航站（源码仓库）

本仓库为 [ad996.com](https://ad996.com) 的公开源码：React（Vite）前端、Python（FastAPI）主站与统计接口、部署脚本与配置模板。  
部署、端口、Nginx、HTTPS 与运维流程见根目录 [`DEPLOY.md`](DEPLOY.md)。

本仓库根目录与生产环境 **`/opt/ai-navigation`** 目录结构一致。若在 **picTent** 主仓库中开发，对应路径为 **`AI导航/`**；同步命令的差异见 **`DEPLOY.md`** 中的「同步命令」表。

---

## 协作与发布职责

| 角色 | 职责 |
|------|------|
| 开发人员 | 完成功能修改与本地验证；将变更提交并推送至本仓库默认分支（或约定的功能分支）。推送前须确认未包含密钥、凭据、`.env`、运行时数据库及 `node_modules`。 |
| 发布负责人 | 拉取最新提交；审阅变更摘要；执行构建（当前端 `dist` 未随提交更新时，须在 `emoji-ai-navigator-main` 目录执行 `npm run build`）；按 `DEPLOY.md` 执行 `deploy/sync-to-server.sh` 同步至服务器。 |

**前端静态资源**：若修改了 `emoji-ai-navigator-main` 内页面或资源，须在提交前执行 **`npm run build`**，并将生成的 **`emoji-ai-navigator-main/dist/`** 纳入版本库，以保证发布与线上一致。若团队约定由发布负责人统一执行构建，须在提交说明或工单中注明。

**规模扩展**：可引入 Pull Request 与代码评审；必要时增加持续集成（构建、静态检查等）。

---

## Git 提交者信息

GitHub 上显示的提交作者，取自执行 `git commit` 环境中的 `user.name` 与 `user.email`。

全局配置示例：

```bash
git config --global user.name "显示名称"
git config --global user.email "邮箱@example.com"
```

仅在本仓库生效：

```bash
cd ad996
git config user.name "显示名称"
git config user.email "邮箱@example.com"
```

---

## 目录说明

| 路径 | 说明 |
|------|------|
| `emoji-ai-navigator-main/` | 前端工程；生产构建产物位于 `dist/` |
| `AI导航采集代码/` | 后端与数据：`api_server.py`、`admin_api.py`、数据与采集相关脚本 |
| `deploy/` | 同步脚本、`systemd` 单元、Nginx 配置示例 |

勿将 `node_modules/`、`venv/`、`admin.db`、`uploads/` 等纳入版本控制（见 `.gitignore`）。

目录名 **`AI导航采集代码/`** 使用中文；在 UTF-8 环境下的 macOS、Linux 及当前 Windows 版本下与现有脚本、服务配置兼容。

---

## 本地运行（开发）

依赖：Git、[Node.js](https://nodejs.org/)（LTS）。

```bash
git clone https://github.com/welovesuzhou/ad996.git
cd ad996/emoji-ai-navigator-main
npm install
npm run dev
```

开发服务器默认监听 `http://localhost:8080`；`/api/*` 在 `vite.config.ts` 中代理至本机 `127.0.0.1:8001`（`admin_api`）。

---

## 生产发布（发布负责人）

操作步骤与前置条件见 [`DEPLOY.md`](DEPLOY.md)。在本仓库根目录执行示例：

```bash
git pull
cd emoji-ai-navigator-main && npm run build && cd ..
bash deploy/sync-to-server.sh
```

若服务器尚未完成初始化，按 `DEPLOY.md` 执行 `deploy/bootstrap-server.sh`。

---

## 许可证

根目录 `LICENSE` 为 MIT。业务数据、密钥及环境相关文件不得提交至本仓库。
