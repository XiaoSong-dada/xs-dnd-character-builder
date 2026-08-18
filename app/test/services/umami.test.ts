import { describe, expect, it } from 'vitest'

import type { UmamiConfig } from '@/config/site'
import { initializeUmami } from '@/services/umami'

const validConfig: UmamiConfig = {
  scriptUrl: 'https://umami.xsmach.cn/script.js',
  websiteId: '9281d909-8c60-40d9-830c-12f2744d2e32',
  domains: ['dnd.xsmach.cn'],
}

function runtime(hostname = 'dnd.xsmach.cn') {
  const scripts: HTMLScriptElement[] = []
  const testDocument = {
    createElement: document.createElement.bind(document),
    getElementById: (id: string) => scripts.find((script) => script.id === id) ?? null,
    head: {
      append: (...nodes: Node[]) => {
        scripts.push(...nodes.filter((node): node is HTMLScriptElement => node instanceof HTMLScriptElement))
      },
    },
  } as unknown as Document

  return { document: testDocument, hostname, scripts }
}

describe('initializeUmami', () => {
  it('配置不完整时不加载脚本', () => {
    const testRuntime = runtime()
    expect(initializeUmami({ ...validConfig, scriptUrl: undefined }, testRuntime)).toBeUndefined()
    expect(initializeUmami({ ...validConfig, websiteId: undefined }, testRuntime)).toBeUndefined()
    expect(initializeUmami({ ...validConfig, domains: [] }, testRuntime)).toBeUndefined()
    expect(testRuntime.scripts).toHaveLength(0)
  })

  it('当前域名不在允许列表时不加载脚本', () => {
    const testRuntime = runtime('localhost')
    expect(initializeUmami(validConfig, testRuntime)).toBeUndefined()
    expect(testRuntime.scripts).toHaveLength(0)
  })

  it('配置有效且域名匹配时写入正确属性', () => {
    const script = initializeUmami(validConfig, runtime())

    expect(script?.defer).toBe(true)
    expect(script?.dataset.domains).toBe('dnd.xsmach.cn')
  })

  it('重复初始化时只插入一个脚本', () => {
    const testRuntime = runtime()
    const first = initializeUmami(validConfig, testRuntime)
    const second = initializeUmami(validConfig, testRuntime)

    expect(second).toBe(first)
    expect(testRuntime.scripts).toHaveLength(1)
  })
})
