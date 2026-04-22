#!/usr/bin/env bash
# 在服务器上「首次」执行：venv、systemd（主站 + admin_api）、Nginx（需已 rsync 到 /opt/ai-navigation）。
# 用法（本机）：
#   RSYNC_SSH='ssh -i ~/.ssh/pictent_aliyun' bash AI导航/deploy/bootstrap-server.sh
#
set -euo pipefail
RSYNC_SSH="${RSYNC_SSH:-ssh -i ${HOME}/.ssh/pictent_aliyun}"
REMOTE_HOST="${REMOTE_HOST:-cookie@ad996.com}"

$RSYNC_SSH "$REMOTE_HOST" bash -s <<'REMOTE'
set -euo pipefail
ROOT="/opt/ai-navigation"
CODE="$ROOT/AI导航采集代码"
UNIT_MAIN="$ROOT/deploy/systemd/ai-navigation-api.service"
UNIT_ADMIN="$ROOT/deploy/systemd/ai-navigation-admin-api.service"
NGX_SRC="$ROOT/deploy/nginx/ai-navigation.conf"

if [ ! -f "$CODE/api_server.py" ]; then
  echo "请先在本机运行 AI导航/deploy/sync-to-server.sh 同步代码" >&2
  exit 1
fi

if [ ! -x "$ROOT/venv/bin/python" ]; then
  python3 -m venv "$ROOT/venv"
fi
PIP_INDEX="${PIP_INDEX:-https://pypi.tuna.tsinghua.edu.cn/simple}"
"$ROOT/venv/bin/pip" install -q -U pip -i "$PIP_INDEX"
"$ROOT/venv/bin/pip" install -q -r "$CODE/requirements.txt" -i "$PIP_INDEX"

sudo cp "$UNIT_MAIN" /etc/systemd/system/ai-navigation-api.service
sudo cp "$UNIT_ADMIN" /etc/systemd/system/ai-navigation-admin-api.service
sudo systemctl daemon-reload
sudo systemctl enable ai-navigation-api ai-navigation-admin-api
sudo systemctl restart ai-navigation-api ai-navigation-admin-api

if command -v nginx >/dev/null 2>&1; then
  if [ -f "$NGX_SRC" ]; then
    echo "==> Nginx（/api/* → 8001，其余 → 8096）"
    sudo cp "$NGX_SRC" /etc/nginx/sites-available/ai-navigation.conf
    if [ ! -e /etc/nginx/sites-enabled/ai-navigation.conf ]; then
      sudo ln -sf /etc/nginx/sites-available/ai-navigation.conf /etc/nginx/sites-enabled/
    fi
    sudo nginx -t && sudo systemctl reload nginx
  fi
else
  echo "未检测到 nginx，仅 systemd。对外需自行反代。"
fi

echo "==> ai-navigation-api :8096"
sudo systemctl --no-pager -l status ai-navigation-api | tail -6
echo "==> ai-navigation-admin-api :8001"
sudo systemctl --no-pager -l status ai-navigation-admin-api | tail -6
echo "==> curl 主站"
curl -sS http://127.0.0.1:8096/health || true
echo ""
echo "==> curl admin 热榜（空库可为 items:[]）"
curl -sS "http://127.0.0.1:8001/api/hot-tools?limit=5" | head -c 400 || true
echo ""
REMOTE
