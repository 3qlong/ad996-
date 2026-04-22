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

将生成的 **`dist/`** 随仓库 `AI导航/` 一并同步到服务器（见上级目录 **`AI导航/DEPLOY.md`**）。

## 与后端关系

| 能力 | 进程 |
|------|------|
| 页面、静态资源、`/health`、`/search`、`/icon-proxy` | `api_server.py` → **8096** |
| 点击统计、热榜 `/api/click`、`/api/hot-*` | `admin_api.py` → **8001**（Nginx 按路径分流） |

完整部署、HTTPS、systemd 名称以 **`AI导航/DEPLOY.md`** 为准。
