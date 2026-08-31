import { computed, ref } from 'vue'

import { siteConfig } from '@/config/site'
import { useUpdateNoticeStore } from '@/stores/update-notice'

export interface AboutExternalLink {
  readonly id: 'bilibili' | 'github'
  readonly label: string
  readonly description: string
  readonly url: string
  readonly iconText: string
}

export interface TipQrCode {
  readonly id: 'wechat' | 'alipay'
  readonly label: string
  readonly imageUrl: string
  readonly alt: string
}

const QQ_GROUP = '831306509'

const externalLinks = [
  {
    id: 'bilibili',
    label: 'B站个人空间',
    description: '关注项目动态与相关内容',
    url: 'https://space.bilibili.com/122674342',
    iconText: 'B',
  },
  {
    id: 'github',
    label: 'GitHub 项目',
    description: '查看源码、版本与开发进展',
    url: 'https://github.com/XiaoSong-dada/xs-dnd-character-builder',
    iconText: 'GH',
  },
] as const satisfies readonly AboutExternalLink[]

function configuredQrCodes(): readonly TipQrCode[] {
  const codes: TipQrCode[] = []
  if (siteConfig.tipQrCodes.wechatUrl) {
    codes.push({
      id: 'wechat',
      label: '微信支付',
      imageUrl: siteConfig.tipQrCodes.wechatUrl,
      alt: '微信支付收款码',
    })
  }
  if (siteConfig.tipQrCodes.alipayUrl) {
    codes.push({
      id: 'alipay',
      label: '支付宝',
      imageUrl: siteConfig.tipQrCodes.alipayUrl,
      alt: '支付宝收款码',
    })
  }
  return codes
}

export function useAboutPage() {
  const updateNoticeStore = useUpdateNoticeStore()
  const copyFeedback = ref('')
  const failedQrCodeIds = ref<ReadonlySet<TipQrCode['id']>>(new Set())
  const activeQrCode = ref<TipQrCode>()
  const qrCodes = configuredQrCodes()

  const availableQrCodes = computed(() => (
    qrCodes.filter((code) => !failedQrCodeIds.value.has(code.id))
  ))

  const copyQqGroup = async (): Promise<void> => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(QQ_GROUP)
      copyFeedback.value = `QQ群号 ${QQ_GROUP} 已复制。`
    } catch {
      copyFeedback.value = `复制失败，请手动复制QQ群号：${QQ_GROUP}`
    }
  }

  const openQrCode = (code: TipQrCode): void => {
    activeQrCode.value = code
  }

  const closeQrCode = (): void => {
    activeQrCode.value = undefined
  }

  const markQrCodeFailed = (id: TipQrCode['id']): void => {
    failedQrCodeIds.value = new Set([...failedQrCodeIds.value, id])
    if (activeQrCode.value?.id === id) closeQrCode()
  }

  return {
    title: '关于本站',
    currentVersion: siteConfig.version,
    projectDescription: '一个面向 D&D 5e 2014 玩家、尤其是新手的免费车卡与跑团辅助工具。通过分步引导、自动计算和规则校验，帮助你更轻松地创建并使用角色卡。',
    freeNotice: '本站永久免费。所有功能均可免费使用；“请杯咖啡”仅为自愿打赏，不会解锁额外功能，也不会影响正常使用。',
    qqGroup: QQ_GROUP,
    externalLinks,
    copyFeedback,
    availableQrCodes,
    activeQrCode,
    copyQqGroup,
    openQrCode,
    closeQrCode,
    markQrCodeFailed,
    openUpdateNotice: updateNoticeStore.openManual,
  } as const
}
