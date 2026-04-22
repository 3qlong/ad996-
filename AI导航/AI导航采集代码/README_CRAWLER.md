# 爬虫与数据管线（补充说明）

- 入口：`main.py`，配置：`config.yaml`。
- 输出：可生成/更新 `ai_bot_tools.jsonl` 等；合并为 `ai_navigation.json` 请用 **`build_ai_navigation_json.py`**。
- 部署与线上进程与 **`../DEPLOY.md`** 中的 **api_server / admin_api** 无关；爬虫在**本机或 CI** 跑即可。
