<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  description: string
  freeNotice: string
  currentVersion: string
  /** 本次构建的 git 短 hash；对外版本号见 currentVersion。 */
  buildCommit: string
  /** 构建时工作区是否含未提交改动。 */
  buildDirty: boolean
  /** 手动对账进行中。 */
  checkChecking: boolean
  /** 手动对账结论文案；空串表示还没查过。 */
  checkFeedback: string
  /** 自动检查周期（天）。 */
  checkIntervalDays: number
  /** 周期输入非法或保存失败时的说明；空串表示没有错误。 */
  checkIntervalError: string
  /** 上次检查说明，让玩家看得出周期是不是在起作用。 */
  checkIntervalHint: string
  /** 输入框的原生范围提示，与设置校验共用同一组边界。 */
  checkIntervalMin: number
  checkIntervalMax: number
}>()

const emit = defineEmits<{ openUpdateNotice: [], checkUpdate: [], saveInterval: [value: string] }>()

/**
 * 输入框草稿。玩家正在输的中间状态不该被设置值冲掉，
 * 因此只在设置真的变了（保存成功、或别处改了周期）时才同步回来。
 */
const intervalDraft = ref(String(props.checkIntervalDays))
watch(
  () => props.checkIntervalDays,
  (value) => {
    intervalDraft.value = String(value)
  },
)

/**
 * 刻意不用 `v-model`：编译器会给 `type="number"` 上的 v-model 套上数字转换，
 * 草稿会变成 number，`abc`、空串这类输入也就无法按原文交给校验。
 * 这里始终以字符串保存，校验与容错都留给调用方。
 */
function onIntervalInput(event: Event): void {
  intervalDraft.value = (event.target as HTMLInputElement).value
}

function commitInterval(): void {
  emit('saveInterval', intervalDraft.value)
}
</script>

<template>
  <section class="about-intro" aria-labelledby="about-intro-title">
    <p id="about-intro-title" class="about-intro__eyebrow">D&amp;D 5e 2014</p>
    <p class="about-intro__description">{{ description }}</p>
    <p class="about-intro__notice">{{ freeNotice }}</p>
    <div class="about-intro__version">
      <span>当前版本 v{{ currentVersion }}</span>
      <button type="button" @click="$emit('openUpdateNotice')">查看本次更新</button>
    </div>
    <div class="about-intro__build">
      <span>
        构建标识 <code>{{ buildCommit }}</code>
        <span v-if="buildDirty" class="about-intro__build-dirty">含未提交改动</span>
      </span>
      <button type="button" :disabled="checkChecking" @click="$emit('checkUpdate')">
        {{ checkChecking ? '检查中…' : '检查更新' }}
      </button>
    </div>
    <p v-if="checkFeedback" class="about-intro__feedback" role="status" aria-live="polite">
      {{ checkFeedback }}
    </p>
    <div class="about-intro__interval">
      <label for="about-update-interval">自动检查更新</label>
      <span class="about-intro__interval-field">
        <input
          id="about-update-interval"
          :value="intervalDraft"
          type="number"
          inputmode="numeric"
          step="1"
          :min="checkIntervalMin"
          :max="checkIntervalMax"
          @input="onIntervalInput"
          @change="commitInterval"
        />
        <span>天一次</span>
      </span>
    </div>
    <p v-if="checkIntervalError" class="about-intro__interval-error" role="alert">
      {{ checkIntervalError }}
    </p>
    <p v-else class="about-intro__interval-hint">{{ checkIntervalHint }}</p>
  </section>
</template>

<style scoped lang="scss">
.about-intro {
  display: grid;
  gap: 0.85rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, var(--color-surface), var(--color-gold-soft));
  box-shadow: var(--shadow-subtle);

  &__eyebrow,
  &__description,
  &__notice,
  &__feedback,
  &__interval-hint,
  &__interval-error {
    margin: 0;
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__description {
    font-size: clamp(1rem, 3vw, 1.15rem);
    line-height: 1.8;
  }

  &__notice {
    padding: 0.9rem 1rem;
    border-left: 0.25rem solid var(--color-success);
    border-radius: var(--radius-sm);
    color: var(--color-success);
    background: var(--color-success-soft);
    font-weight: 700;
    line-height: 1.7;
  }

  &__version,
  &__build {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;

    > span {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      font-weight: 700;
    }

    > button {
      min-height: 2.75rem;
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-surface);
      font-weight: 700;
      cursor: pointer;

      &:disabled {
        cursor: default;
        opacity: 0.6;
      }

      &:focus-visible {
        outline: 0.15rem solid var(--color-primary);
        outline-offset: 0.1rem;
      }
    }

    code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.85em;
      letter-spacing: 0.02em;
    }
  }

  &__build {
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);
  }

  &__build-dirty {
    margin-left: 0.4rem;
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
    color: var(--color-warning);
    background: var(--color-warning-soft);
    font-size: 0.72rem;
    font-weight: 700;
  }

  &__interval {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--color-border);

    label {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      font-weight: 700;
    }
  }

  &__interval-field {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 700;

    input {
      width: 5rem;
      min-height: 2.75rem;
      padding: 0.55rem 0.6rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text);
      background: var(--color-surface);
      font: inherit;
      text-align: center;

      &:focus-visible {
        outline: 0.15rem solid var(--color-primary);
        outline-offset: 0.1rem;
      }
    }
  }

  &__interval-hint {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }

  &__interval-error {
    color: var(--color-error);
    font-size: 0.85rem;
    line-height: 1.6;
  }

  &__feedback {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }
}
</style>
