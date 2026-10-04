/**
 * `bundledSkillDir` 求值链的真实 cordis 复现。
 *
 * 本套件跑**真的** `@deepseek-ai/cordis` + `cordis-plugin-loader`，而不是替身：
 * 被测的正是 Loader 自身的行为——patch 里的 `!!js` 表达式在 `internal/config`
 * 瀑布上被求值后交给 fiber，而 `entry.options.config` 里保形保留表达式节点。
 * 若上游改成「options 直接存求值结果」，这里会红，`pluginSkillRoots` 读 fiber
 * 的前提也就必须重新判断。
 */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'

import { pluginSkillRoots } from '../src/service.ts'

describe('bundledSkillDir 从 fiber 读取（真实 Loader）', () => {
  let dir: string
  let skillDir: string
  let ctx: Context | undefined

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'smc-loader-probe-'))
    skillDir = join(dir, 'plugin-skills')
    await mkdir(skillDir, { recursive: true })
    await writeFile(join(skillDir, 'SKILL.md'), '---\nname: probe-skill\ndescription: probe\n---\n', 'utf8')
    await writeFile(join(dir, 'probe.mjs'), 'export function apply() {}\n', 'utf8')
  })

  afterEach(async () => {
    await ctx?.fiber.dispose()
    ctx = undefined
    delete process.env.SMC_PROBE_SKILL_DIR
    await rm(dir, { recursive: true, force: true })
  })

  it('表达式在 fiber.config 上已求值成路径，options 上仍是 __jsExpr 节点', async () => {
    process.env.SMC_PROBE_SKILL_DIR = skillDir
    const instance = new Context()
    ctx = instance
    await instance.plugin(Loader, { baseUrl: `${pathToFileURL(dir).href}/` })
    await instance.loader.create({
      id: 'probe-plugin',
      name: './probe.mjs',
      config: { bundledSkillDir: { __jsExpr: 'process.env.SMC_PROBE_SKILL_DIR' } },
    })
    await instance.loader.await()

    const entry = [...instance.loader.entries()].find(item => item.options.id === 'probe-plugin')
    expect(entry).toBeDefined()

    // 存下来的 options 保留表达式节点——照它去拼路径只会落空。
    expect((entry!.options.config as { bundledSkillDir: unknown }).bundledSkillDir)
      .toEqual({ __jsExpr: 'process.env.SMC_PROBE_SKILL_DIR' })
    // fiber 拿到的才是求值结果。
    expect((entry!.fiber?.config as { bundledSkillDir: unknown }).bundledSkillDir).toBe(skillDir)

    // 被测函数因此能发现这个根。
    expect(pluginSkillRoots(instance.loader.entries(), null)).toEqual([
      { dir: skillDir, label: 'plugin:probe-plugin' },
    ])
  })

  it('表达式求值失败时 entry 不激活，发现结果里不出现半成品根', async () => {
    delete process.env.SMC_PROBE_SKILL_DIR
    const instance = new Context()
    ctx = instance
    await instance.plugin(Loader, { baseUrl: `${pathToFileURL(dir).href}/` })
    await instance.loader.create({
      id: 'probe-plugin',
      name: './probe.mjs',
      config: { bundledSkillDir: { __jsExpr: 'process.env.SMC_PROBE_SKILL_DIR' } },
    })
    await instance.loader.await().catch(() => undefined)

    // 无论 entry 是否激活，都不能凭空产出一个不存在的技能根。
    expect(pluginSkillRoots(instance.loader.entries(), null)).toEqual([])
  })
})
