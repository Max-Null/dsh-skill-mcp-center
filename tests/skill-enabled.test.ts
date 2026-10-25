/**
 * 技能热插拔的 host 侧契约：停用 = 注册同名占位，启用 = 调 disposer，清单落盘并在重启后重放。
 *
 * 用 stub skills 服务而不是真 registry：被测的是本插件的记账与重放，
 * 而「runtime rank 250 真的赢过包内 550」是 DSH 的行为，已在
 * `docs/设计/Skill与MCP管理中心-插件技能发现.md` §热插拔 里有隔离实例实测。
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'

import { SkillMcpService } from '../src/service.ts'

function makeService() {
  const instance = new Context()
  const registered: Array<{ name: string, disposed: boolean }> = []
  const loader = { entries: () => [], update: async () => {} }
  const tools = { schemas: () => [] as unknown[] }
  const skills = {
    list: async () => [] as unknown[],
    register: (reg: { name: string }) => {
      const rec = { name: reg.name, disposed: false }
      registered.push(rec)
      return () => { rec.disposed = true }
    },
  }
  instance.provide('loader' as never, loader as never)
  instance.provide('tools' as never, tools as never)
  instance.provide('skills' as never, skills as never)
  return { service: new SkillMcpService(instance), registered }
}

async function readDisabled(home: string): Promise<string[]> {
  const raw = JSON.parse(await readFile(join(home, 'skill-mcp-center', 'disabled-skills.json'), 'utf8')) as { names: string[] }
  return raw.names
}

describe('技能热插拔：占位遮蔽与清单持久化', () => {
  let home: string

  beforeEach(async () => {
    home = await mkdtemp(join(tmpdir(), 'smc-disabled-'))
    process.env.DSH_HOME = home
  })

  afterEach(async () => {
    delete process.env.DSH_HOME
    await rm(home, { recursive: true, force: true })
  })

  it('停用：注册同名占位，清单落盘', async () => {
    const { service, registered } = makeService()
    await service.setSkillEnabled('demo-skill', false)
    expect(registered.map(r => r.name)).toEqual(['demo-skill'])
    expect(await readDisabled(home)).toEqual(['demo-skill'])
  })

  it('启用：调 disposer，清单移除', async () => {
    const { service, registered } = makeService()
    await service.setSkillEnabled('demo-skill', false)
    await service.setSkillEnabled('demo-skill', true)
    expect(registered[0]?.disposed).toBe(true)
    expect(await readDisabled(home)).toEqual([])
  })

  it('重启重放：新实例读同一份清单并重新注册占位', async () => {
    const first = makeService()
    await first.service.setSkillEnabled('demo-skill', false)

    const second = makeService()
    await second.service.listSkills()
    expect(second.registered.some(r => r.name === 'demo-skill')).toBe(true)
  })
})
