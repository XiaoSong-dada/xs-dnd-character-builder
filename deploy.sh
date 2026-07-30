#!/usr/bin/env sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "错误：未找到 git 命令。" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "错误：未找到 docker 命令。" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "错误：当前 Docker 未安装 Compose V2 插件。" >&2
  exit 1
fi

BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
  echo "错误：当前处于 detached HEAD，无法确定要拉取的分支。" >&2
  exit 1
fi

REMOTE=${GIT_REMOTE:-origin}

echo "==> 拉取 ${REMOTE}/${BRANCH}"
git pull --ff-only "$REMOTE" "$BRANCH"

echo "==> 拉取基础镜像并重新编排"
docker compose up \
  -d \
  --build \
  --pull always \
  --force-recreate \
  --remove-orphans

echo "==> 当前服务状态"
docker compose ps

echo "部署完成。访问端口：${APP_PORT:-8080}"
