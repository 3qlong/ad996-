# AI 导航采集与服务端

- **爬虫 / 数据**：`main.py`、`config.yaml`、各 `*_crawler.py` — 抓取并汇总工具数据。
- **JSON 合并**：`build_ai_navigation_json.py`（由 `ai_bot_tools.jsonl` 生成 `ai_navigation.json`）。
- **线上主服务**：`api_server.py` — 挂载 `emoji-ai-navigator-main/dist`，提供搜索与健康检查等。
- **管理 / 统计 API**：`admin_api.py` + `database.py` — SQLite `admin.db`，对外由 Nginx 将 `/api/click`、`/api/hot-*` 反代至 **8001**。
- **部署与发布**：见上级 **`../DEPLOY.md`**（含 systemd、Nginx、HTTPS、双进程说明）。

本目录下 **`README.md`（旧版爬虫长文档）** 若与 `../DEPLOY.md` 冲突，**以 `DEPLOY.md` 为准**。
