import { describe, expect, it } from 'vitest'

import { backgrounds2014 } from '@/rules/data/origins-2014'

describe('2014 背景介绍登记', () => {
  it('全部背景 description 非空且不含占位文本', () => {
    expect(backgrounds2014.length).toBeGreaterThanOrEqual(40)
    for (const background of backgrounds2014) {
      expect(background.description.trim(), `${background.id} 应有详细介绍`).not.toBe('')
      expect(background.description, `${background.id} 不应是占位文本`).not.toContain('占位')
    }
  })

  it('背景介绍包含核心决策信息（抽查）', () => {
    const byId = new Map(backgrounds2014.map((background) => [background.id, background]))
    // 侍僧：信仰庇护 + 洞悉技能
    expect(byId.get('background-2014-acolyte')?.description).toContain('信仰庇护')
    expect(byId.get('background-2014-acolyte')?.description).toContain('洞悉')
    // 水手变体海盗：恶名
    expect(byId.get('background-2014-sailor-pirate')?.description).toContain('恶名')
    // 扩展背景抽查：城市守卫守卫之眼、俄佐立公会法术、葛加理制毒工具、运动员胜利回声
    expect(byId.get('background-2014-city-watch')?.description).toContain('守卫之眼')
    expect(byId.get('background-2014-azorius-functionary')?.description).toContain('公会法术')
    expect(byId.get('background-2014-golgari-agent')?.description).toContain('制毒工具')
    expect(byId.get('background-2014-athlete')?.description).toContain('胜利回声')
  })
})
