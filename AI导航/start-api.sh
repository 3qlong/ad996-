#!/bin/sh
# 端口 8096：与 pictent-api(3000)、admin_api(8001)、Vite(8080) 错开；云端 Nginx 反代到本机 8096
cd "$(dirname "$0")/AI导航采集代码" || exit 1
exec python3 api_server.py --host 127.0.0.1 --port 8096
