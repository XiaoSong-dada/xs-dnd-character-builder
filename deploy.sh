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

echo "==> 计算构建标识"
# 与 app/scripts/app-build-id.ts 的规则保持一致：干净工作区用 commit 短 hash，
# 有未提交改动时用 `<commit>-dirty-<未提交内容摘要>`。
# 容器内没有 .git，只能在这里算好再经 build arg 传入，否则构建期会降级为 -nogit。
# 摘要算法必须与构建脚本相同（sha256 取前 8 位），否则同一份工作区在
# 「本地 pnpm build」与「deploy.sh 部署」下会得到不同标识，产生假更新提示。
hash_stdin() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum | cut -c1-8
  else
    shasum -a 256 | cut -c1-8
  fi
}

APP_BUILD_ID=$(git rev-parse --short HEAD)

if [ -n "$(git status --porcelain)" ]; then
  # 摘要输入顺序与构建脚本一致：diff 内容，然后按路径排序的未跟踪文件「路径 + 内容」。
  DIRTY_DIGEST=$(
    {
      git diff HEAD --binary
      git ls-files --others --exclude-standard | LC_ALL=C sort | while IFS= read -r file; do
        printf '%s' "$file"
        cat -- "$file" 2>/dev/null || printf '%s' '<unreadable>'
      done
    } | hash_stdin
  )
  APP_BUILD_ID="${APP_BUILD_ID}-dirty-${DIRTY_DIGEST}"
  echo "    工作区有未提交改动，标识带 -dirty- 后缀"
fi

export APP_BUILD_ID
echo "    APP_BUILD_ID=${APP_BUILD_ID}"

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
