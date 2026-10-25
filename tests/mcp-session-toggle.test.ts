/**
 * `sessionToggled` 的语义：只有「本次运行内被面板改过开关」的条目才标记它。
 *
 * 这条字段存在的理由就是区分两种「关」——面板关的（重启会回来）与
 * `cordis.patch.yml` 里 `disabled: true` 的（重启仍然关）。用最小 stub 而不是
 * 真 Loader：被测的是 service 自己的记账，Loader 的行为另有
 * `bundled-skill-dir-loader.test.ts` 覆盖，这里连真 MCP 会引入无关的进程。
 */
import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'

import { SkillMcpService } from '../src/service.ts'

function makeService(entries: unknown[], onUpdate?: (id: string, options: unknown) => void) {
  const instance = new Context()
  const loader = {
    entries: () => entries,
    update: async (id: string, options: unknown) => { onUpdate?.(id, options) },
  }
  const tools = { schemas: () => [] as unknown[] }
  instance.provide('loader' as never, loader as never)
  instance.provide('tools' as never, tools as never)
  const service = new SkillMcpService(instance)
  return { service, loader }
}

function mcpEntry(id: string, serverName: string, disabled = false) {
  return {
    id,
    options: { name: '@deepseek-ai/dsh-mcp-client', config: { serverName, transport: 'stdio', command: 'npx' } },
    disabled,
    fiber: undefined,
  }
}

describe('MCP 开关的会话内记账', () => {
  it('未动过的条目 sessionToggled 为 false（含 patch 里 disabled 的条目）', async () => {
    const { service } = makeService([mcpEntry('mcp-rea', 'rea'), mcpEntry('mcp-off', 'off', true)])
    const servers = await service.listMcpServers()
    expect(servers.map(s => s.sessionToggled)).toEqual([false, false])
    expect(servers.map(s => s.disabled)).toEqual([false, true])
  })

  it('面板关掉之后该条目被标记，patch 禁用的条目不受影响', async () => {
    const updates: Array<{ id: string, options: unknown }> = []
    const { service } = makeService(
      [mcpEntry('mcp-rea', 'rea'), mcpEntry('mcp-off', 'off', true)],
      (id, options) => updates.push({ id, options }),
    )
    await service.setMcpServerEnabled('mcp-rea', false)
    expect(updates).toEqual([{ id: 'mcp-rea', options: { disabled: true } }])

    const servers = await service.listMcpServers()
    expect(servers.find(s => s.id === 'mcp-rea')?.sessionToggled).toBe(true)
    expect(servers.find(s => s.id === 'mcp-off')?.sessionToggled).toBe(false)
  })

  it('重新启用同样算「本次运行改过」', async () => {
    const { service } = makeService([mcpEntry('mcp-rea', 'rea', true)])
    await service.setMcpServerEnabled('mcp-rea', true)
    const server = (await service.listMcpServers()).find(s => s.id === 'mcp-rea')
    expect(server?.sessionToggled).toBe(true)
  })

  it('对象型 args 归一成字符串——面板不再渲染 [object Object]', async () => {
    const entry = {
      id: 'mcp-playwright',
      options: {
        name: '@deepseek-ai/dsh-mcp-client',
        config: {
          serverName: 'playwright',
          transport: 'stdio',
          command: 'npx',
          args: ['--headless', { browser: 'chromium' }],
        },
      },
      disabled: false,
      fiber: undefined,
    }
    const { service } = makeService([entry])
    const server = (await service.listMcpServers())[0]
    expect(server?.args).toEqual(['--headless', '{"browser":"chromium"}'])
  })
})
