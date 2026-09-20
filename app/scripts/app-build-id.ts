/**
 * 构建标识：PWA 更新检测的对账依据。
 *
 * 规则（与 docs/需求文档/PWA离线与可安装-更新计划.md 一致）：
 * - 构建时工作区干净 → `<commit 短 hash>`；
 * - 构建时工作区有未提交改动 → `<commit 短 hash>-dirty-<未提交内容摘要>`；
 * - 拿不到 git 信息（容器内没有 .git 且未注入）→ `v<package.json 版本>-nogit`，并在构建日志里告警。
 *
 * 之所以要在宿主机算好再注入：`app/Dockerfile` 不 COPY `.git`，容器内执行 git 必然失败。
 * `deploy.sh` 本来就在宿主 git 仓库里运行，由它算出该值经 build arg 传入。
 * 本地 `pnpm build` 没有注入值，直接读仓库 git。
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'

/** 构建标识产物文件名；运行时以 no-store 拉取后与本进程注入值比对。 */
export const APP_BUILD_ID_FILE = 'version.json'

/**
 * 构建期注入的全局常量名。
 * 不要复用 `__APP_VERSION__`：那个是 package.json 的对外版本号（供更新公告比对），语义不同。
 */
export const APP_BUILD_ID_DEFINE = '__APP_BUILD_ID__'

/** 读不到 git 时的标识后缀，用来在界面上暴露「这个构建没有 git 信息」。 */
export const NO_GIT_SUFFIX = 'nogit'

/** 注入值中区分干净 / 脏构建的分隔符，取 git 惯例的 `-dirty-`。 */
export const DIRTY_MARKER = '-dirty-'

/** 未提交内容摘要的取值长度。 */
const DIRTY_DIGEST_LENGTH = 8

/** `git diff` 输出可能很大（含二进制差异），放宽子进程缓冲上限。 */
const GIT_MAX_BUFFER = 64 * 1024 * 1024

/** git 探测结果；拆成独立结构是为了让 `resolveAppBuildId` 可以在测试里注入。 */
export interface GitProbe {
  readonly commit: string
  readonly dirty: boolean
  readonly dirtyDigest?: string
}

export type GitProbeReader = (cwd: string) => GitProbe

export type AppBuildIdSource = 'injected' | 'git' | 'fallback'

export interface AppBuildId {
  /** 对账主键 */
  readonly id: string
  /** HEAD 短 hash；读不到 git 时为 undefined */
  readonly commit?: string
  /** 构建时工作区是否含未提交改动 */
  readonly dirty: boolean
  /** 标识来源，供构建日志区分「宿主机注入 / 本地读 git / 降级」 */
  readonly source: AppBuildIdSource
  /** 生成时间，仅供排查，不参与对账 */
  readonly builtAt: string
}

/** 组合对账标识。集中规则以便单测覆盖干净 / 脏两种形态。 */
export function formatAppBuildId(commit: string, dirtyDigest?: string): string {
  return dirtyDigest ? `${commit}${DIRTY_MARKER}${dirtyDigest}` : commit
}

/** 把若干内容片段摘要成短 hash；片段顺序必须稳定。 */
export function digestDirtyContent(chunks: readonly (string | Uint8Array)[]): string {
  const hash = createHash('sha256')
  for (const chunk of chunks) hash.update(chunk)
  return hash.digest('hex').slice(0, DIRTY_DIGEST_LENGTH)
}

/** 从注入值反解 commit 与是否脏；git hash 是十六进制，`-dirty-` 不会产生歧义。 */
export function parseAppBuildId(id: string): Pick<AppBuildId, 'id' | 'commit' | 'dirty'> {
  const markerIndex = id.indexOf(DIRTY_MARKER)
  if (markerIndex < 0) return { id, commit: id, dirty: false }
  return { id, commit: id.slice(0, markerIndex), dirty: true }
}

function gitText(args: readonly string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

function gitBuffer(args: readonly string[], cwd: string): Uint8Array {
  return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: GIT_MAX_BUFFER })
}

/**
 * 汇总未提交内容：`git diff HEAD`（含已暂存与未暂存）加上未跟踪文件内容。
 * 只要求「改动不同则摘要不同」，不追求与 git 自身的 object hash 一致。
 * 未跟踪文件的路径先排序，保证同一份改动重算结果稳定。
 */
function readUncommittedDigest(cwd: string): string {
  const chunks: (string | Uint8Array)[] = [gitBuffer(['diff', 'HEAD', '--binary'], cwd)]

  const untracked = gitText(['ls-files', '--others', '--exclude-standard'], cwd)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort()

  for (const file of untracked) {
    chunks.push(file)
    try {
      chunks.push(readFileSync(resolve(cwd, file)))
    } catch {
      // 目录（子模块）或读取失败：只记录路径占位，保持摘要稳定，不中断构建。
      chunks.push('<unreadable>')
    }
  }

  return digestDirtyContent(chunks)
}

/** 探测仓库当前状态：HEAD 短 hash 与未提交改动摘要。任何 git 不可用的情形都抛错。 */
export function readGitProbe(cwd: string): GitProbe {
  const commit = gitText(['rev-parse', '--short', 'HEAD'], cwd)
  const dirty = gitText(['status', '--porcelain'], cwd).length > 0
  return { commit, dirty, dirtyDigest: dirty ? readUncommittedDigest(cwd) : undefined }
}

/** 解析本次构建的标识。`injected` 为空时回退到本地 git，两者都不可用则降级。 */
export function resolveAppBuildId(
  cwd: string,
  fallbackVersion: string,
  injected: string | undefined = process.env.APP_BUILD_ID,
  readProbe: GitProbeReader = readGitProbe,
): AppBuildId {
  const builtAt = new Date().toISOString()
  const normalized = injected?.trim()
  if (normalized) return { ...parseAppBuildId(normalized), source: 'injected', builtAt }

  try {
    const probe = readProbe(cwd)
    const id = formatAppBuildId(probe.commit, probe.dirty ? probe.dirtyDigest : undefined)
    return { id, commit: probe.commit, dirty: probe.dirty, source: 'git', builtAt }
  } catch {
    return { id: `v${fallbackVersion}-${NO_GIT_SUFFIX}`, dirty: false, source: 'fallback', builtAt }
  }
}

/**
 * 把标识写进 `dist/version.json`，并把常量注入客户端代码。
 * 只在客户端构建输出：vite-ssg 的 SSR 构建产物进 `.vite-ssg-temp`，写进去没有意义。
 */
export function appBuildIdPlugin(buildId: AppBuildId): Plugin {
  let isSsr = false

  return {
    name: 'app-build-id',
    apply: 'build',
    configResolved(config) {
      isSsr = Boolean(config.build.ssr)
    },
    generateBundle() {
      if (isSsr) return
      this.emitFile({
        type: 'asset',
        fileName: APP_BUILD_ID_FILE,
        source: `${JSON.stringify(
          { id: buildId.id, commit: buildId.commit, dirty: buildId.dirty, builtAt: buildId.builtAt },
          null,
          2,
        )}\n`,
      })
    },
  }
}
