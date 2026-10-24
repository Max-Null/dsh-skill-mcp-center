import { describe, expect, it } from 'vitest'

import { hasSkillFile, skillKeyOf } from '../client/skill-key.ts'

/**
 * 代码注册的 skill（`ctx.skills.register()`）没有 SKILL.md，`listSkills` 对它们
 * 一律报 `path: ''`（见 `SkillMcpService.runtimeOnlySkills`）。面板此前拿这个空串
 * 当展开/阅读状态的身份，于是所有运行时条目共用一个 key —— 点开一张卡，同组全部
 * 展开，并且「查看 SKILL.md」会把空路径发给 `readSkill`，换回一句
 * `readSkill: path is required`。
 *
 * 这些用例锁住两件事：空路径的条目必须拿到各自稳定的身份，且必须被判定为「没有
 * 可读文件」；磁盘条目保持原样，路径即身份。
 */
describe('skillKeyOf 技能行身份', () => {
  it('磁盘条目直接用 SKILL.md 路径作身份', () => {
    const skill = { name: 'spider-king', path: '/home/u/.dsh/skills/spider-king/SKILL.md' }
    expect(skillKeyOf(skill)).toBe('/home/u/.dsh/skills/spider-king/SKILL.md')
  })

  it('运行时条目按名字区分，不再共用空串', () => {
    const a = { name: 'office', path: '' }
    const b = { name: 'browser-skill', path: '' }
    expect(skillKeyOf(a)).toBe('\u0000runtime:office')
    expect(skillKeyOf(b)).toBe('\u0000runtime:browser-skill')
    expect(skillKeyOf(a)).not.toBe(skillKeyOf(b))
  })

  it('运行时身份与任何真实路径都不相撞', () => {
    const runtime = skillKeyOf({ name: 'office', path: '' })
    // A NUL byte cannot occur in a path, so this literal can never be a real path.
    expect(runtime).not.toBe('runtime:office')
    expect(skillKeyOf({ name: 'office', path: 'runtime:office' })).toBe('runtime:office')
    expect(skillKeyOf({ name: 'office', path: 'runtime:office' })).not.toBe(runtime)
  })

  it('同一运行时条目多次求值得到同一身份', () => {
    const skill = { name: 'genui', path: '' }
    expect(skillKeyOf(skill)).toBe(skillKeyOf({ ...skill }))
  })

  it('同名技能按来源分属不同路径时仍是两个身份', () => {
    const project = { name: 'lint', path: '/w/.agents/skills/lint/SKILL.md' }
    const user = { name: 'lint', path: '/home/u/.dsh/skills/lint/SKILL.md' }
    expect(skillKeyOf(project)).not.toBe(skillKeyOf(user))
  })
})

describe('hasSkillFile 可读性判定', () => {
  it('运行时条目没有可读文件', () => {
    expect(hasSkillFile({ name: 'office', path: '' })).toBe(false)
  })

  it('磁盘条目有可读文件', () => {
    expect(hasSkillFile({ name: 'spider-king', path: '/home/u/.dsh/skills/spider-king/SKILL.md' })).toBe(true)
  })

  it('与 skillKeyOf 的运行时前缀判定一致', () => {
    for (const skill of [
      { name: 'office', path: '' },
      { name: 'spider-king', path: '/a/SKILL.md' },
      { name: 'genui', path: '' },
    ]) {
      expect(hasSkillFile(skill)).toBe(skillKeyOf(skill) !== `\u0000runtime:${skill.name}`)
    }
  })
})
