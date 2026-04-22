# AI 导航前端（ad996.com）

React + Vite + TypeScript。**线上首页**由 `npm run build` 产出 `dist/`，再由 `AI导航采集代码/api_server.py` 挂载到本机 **8096**（经 Nginx 以 **https://ad996.com** 对外）。

## 本地开发

```bash
npm install
npm run dev
# 默认 http://localhost:8080 ，/api/* 在 vite.config 里代理到 127.0.0.1:8001（admin_api）
```

## 发布前构建

```bash
npm run build
```

将生成的 **`dist/`** 纳入提交并随仓库同步至服务器。说明见：picTent 内 **`AI导航/DEPLOY.md`**；独立仓库 **[`DEPLOY.md`](https://github.com/welovesuzhou/ad996/blob/main/DEPLOY.md)**（根目录）。

## 与后端关系

| 能力 | 进程 |
|------|------|
| 页面、静态资源、`/health`、`/search`、`/icon-proxy` | `api_server.py` → **8096** |
| 点击统计、热榜 `/api/click`、`/api/hot-*` | `admin_api.py` → **8001**（Nginx 按路径分流） |

部署、HTTPS、`systemd` 服务名等以 **`AI导航/DEPLOY.md`**（picTent）或仓库根目录 **`DEPLOY.md`**（独立仓库）为准。
