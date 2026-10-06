import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { deleteTargetOf } from '../src/service.ts'

/**
 * 删除目标的解析与拒绝面。
 *
 * 判据是「**正好是某个允许根的直接子项**」，而不是前缀匹配 —— 这一条同时挡住
 * 根自身、技能内部的嵌套文件；插件包目录则由「不在允许根列表里」挡住（见
 * `service.ts` 的 `deletableRoots`）。
 */
describe('deleteTargetOf 删除目标解析', () => {
  const userRoot = join('home', '.dsh', 'skills')
  const workspaceRoot = join('work', 'proj', '.dsh', 'skills')
  const roots = [userRoot, workspaceRoot]

  it('目录形态：SKILL.md 的删除目标是它所在的技能目录', () => {
    expect(deleteTargetOf(join(userRoot, 'demo', 'SKILL.md'), roots)).toBe(join(userRoot, 'demo'))
  })

  it('平铺形态：删除目标就是这个 .md 文件', () => {
    expect(deleteTargetOf(join(userRoot, 'flat.md'), roots)).toBe(join(userRoot, 'flat.md'))
  })

  it('工作区根下的技能同样可删', () => {
    expect(deleteTargetOf(join(workspaceRoot, 'wk', 'SKILL.md'), roots)).toBe(join(workspaceRoot, 'wk'))
  })

  it('根自身不是可删条目', () => {
    expect(() => deleteTargetOf(userRoot, roots)).toThrow('skill-not-found')
    expect(() => deleteTargetOf(join(userRoot, 'SKILL.md'), roots)).toThrow('skill-not-found')
  })

  it('技能内部的嵌套文件不可删', () => {
    expect(() => deleteTargetOf(join(userRoot, 'demo', 'references', 'api.md'), roots))
      .toThrow('skill-not-found')
  })

  it('允许根之外的路径一律拒绝', () => {
    const pluginPath = join('AppData', 'ssid-plugins', 'node_modules', '@max-null', 'dsh-skills', 'skills', 'x', 'SKILL.md')
    expect(() => deleteTargetOf(pluginPath, roots)).toThrow('skill-not-found')
    expect(() => deleteTargetOf(join('home', '.agents', 'skills', 'a', 'SKILL.md'), roots))
      .toThrow('skill-not-found')
  })

  it('名字相近的兄弟目录不算命中', () => {
    expect(() => deleteTargetOf(join(`${userRoot}-notes`, 'demo', 'SKILL.md'), roots))
      .toThrow('skill-not-found')
  })
})
