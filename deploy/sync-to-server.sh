#!/usr/bin/env bash
# 从本机仓库执行：将本仓库根目录（与 /opt/ai-navigation 同构）同步到云端并重启 systemd。
#
# 用法：
#   独立仓库 ad996 根目录：bash deploy/sync-to-server.sh
#   picTent 主仓根目录：    bash AI导航/deploy/sync-to-server.sh
#
# 可选环境变量：
#   RSYNC_SSH   默认: ssh -i ~/.ssh/pictent_aliyun
#   RSYNC_DEST  默认: cookie@ad996.com:/opt/ai-navigation
#
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AI_NAV="$(cd "$SCRIPT_DIR/.." && pwd)"

RSYNC_SSH="${RSYNC_SSH:-ssh -i ${HOME}/.ssh/pictent_aliyun}"
RSYNC_DEST="${RSYNC_DEST:-cookie@ad996.com:/opt/ai-navigation}"

REMOTE_HOST="${RSYNC_DEST%%:*}"

echo "==> rsync ${AI_NAV}/ -> ${RSYNC_DEST}/"
rsync -avz \
  -e "$RSYNC_SSH" \
  --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'venv/' \
  --exclude '.venv/' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  "$AI_NAV/" "${RSYNC_DEST}/"

echo "==> remote: venv + pip + restart ai-navigation-api + ai-navigation-admin-api"
$RSYNC_SSH "$REMOTE_HOST" bash -s <<REMOTE_EOF
set -euo pipefail
ROOT="/opt/ai-navigation"
CODE="\$ROOT/AI导航采集代码"
if [ ! -f "\$CODE/api_server.py" ]; then
  echo "missing \$CODE/api_server.py" >&2
  exit 1
fi
if [ ! -x "\$ROOT/venv/bin/pip" ]; then
  echo "==> create venv"
  python3 -m venv "\$ROOT/venv"
fi
# 国内机房直连 PyPI 易超时，默认走清华镜像（可改 PIP_INDEX）
PIP_INDEX="\${PIP_INDEX:-https://pypi.tuna.tsinghua.edu.cn/simple}"
"\$ROOT/venv/bin/pip" install -q -r "\$CODE/requirements.txt" -i "\$PIP_INDEX"
sudo systemctl daemon-reload 2>/dev/null || true
for SVC in ai-navigation-api ai-navigation-admin-api; do
  if systemctl is-enabled "\$SVC" >/dev/null 2>&1; then
    sudo systemctl restart "\$SVC"
    sudo systemctl --no-pager -l status "\$SVC" | tail -4 || true
  else
    echo "服务未安装: \$SVC — 首次请 bash deploy/bootstrap-server.sh（picTent 主仓为 bash AI导航/deploy/bootstrap-server.sh）"
  fi
done
REMOTE_EOF

echo "==> done. 本机验收: curl -sS http://127.0.0.1:8096/health"
echo "    admin: curl -sS 'http://127.0.0.1:8001/api/hot-tools?limit=3'"
echo "    公网: curl -sfS https://ad996.com/health"
