import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// cordis 的 Service 基类在构造时会访问真实 ctx 的根作用域。本套只测引擎的
// 文件操作，把基类换成只吞构造参数的替身（与 rpc-transport.test.ts 同法）。
vi.mock('@deepseek-ai/cordis', () => ({
  Service: class {
    constructor(_ctx: unknown, _name: string) {}
  },
}))

import { SkillMcpService } from '../src/service.ts'

/**
 * 删除的真实文件操作：整目录 / 平铺文件各自进回收目录，拒绝时文件原样不动。
 *
 * cwd 一律指向临时目录，所以「允许的根」落在临时区里 —— 测试**不会**碰真实
 * 的用户级技能目录。回收目录按返回值逐个清理。
 */
describe('deleteSkill 真实文件操作', () => {
  let cwd: string
  const trashed: string[] = []

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'smc-delete-'))
  })

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true })
    for (const path of trashed.splice(0)) await rm(path, { recursive: true, force: true })
  })

  /** 删除路径不读 loader，给个空壳 ctx 即可。 */
  const service = (): SkillMcpService => new SkillMcpService({ loader: { entries: () => [] } } as never)

  it('目录形态：整目录进回收目录，附带文件完好', async () => {
    const dir = join(cwd, '.dsh', 'skills', 'probe')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'SKILL.md'), '---\nname: probe\ndescription: d\n---\n\nbody\n', 'utf8')
    await writeFile(join(dir, 'references.md'), 'ref\n', 'utf8')

    const { trashPath } = await service().deleteSkill(join(dir, 'SKILL.md'), cwd)
    trashed.push(trashPath)

    await expect(stat(dir)).rejects.toThrow()
    expect(await readFile(join(trashPath, 'SKILL.md'), 'utf8')).toContain('name: probe')
    expect(await readFile(join(trashPath, 'references.md'), 'utf8')).toBe('ref\n')
  })

  it('平铺形态：只移动那一个 .md', async () => {
    const root = join(cwd, '.dsh', 'skills')
    await mkdir(root, { recursive: true })
    const file = join(root, 'flat.md')
    await writeFile(file, '---\nname: flat\ndescription: d\n---\n', 'utf8')

    const { trashPath } = await service().deleteSkill(file, cwd)
    trashed.push(trashPath)

    await expect(stat(file)).rejects.toThrow()
    expect(trashPath.endsWith('flat.md')).toBe(true)
  })

  it('不给 cwd 时工作区技能不可删，且文件原样不动', async () => {
    const dir = join(cwd, '.dsh', 'skills', 'probe')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'SKILL.md'), '---\nname: probe\ndescription: d\n---\n', 'utf8')

    await expect(service().deleteSkill(join(dir, 'SKILL.md'))).rejects.toThrow('skill-not-found')
    expect((await stat(dir)).isDirectory()).toBe(true)
  })
})
