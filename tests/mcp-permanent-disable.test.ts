/**
 * 「永久禁用」的落盘语义：把 `disabled: true` 写进可写的 `cordis.patch.yml`。
 *
 * 面板原有开关只改内存（宿主把 Loader 根树的 write 做成空实现 `write() {}`），
 * 重启即恢复；这条路径是唯一能让「关」活过重启的方式。这里同时钉住三件事：
 * 插入位置与同级字段对齐、重复点击幂等、解除后文件字节级还原——按行编辑而不是
 * YAML 解析后再序列化，正是为了不丢作者的注释与字段顺序。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'

import { SkillMcpService } from '../src/service.ts'

const PATCH = `# 全局 patch 层
- insert:
    - id: rea-mcp
      name: "@deepseek-ai/dsh-mcp-client"
      config:
        serverName: rea
        transport: stdio
        command: node
        args:
          - rea.mjs
          - mcp
`

function mcpEntry(id: string, serverName: string, disabled = false) {
  return {
    id,
    options: { name: '@deepseek-ai/dsh-mcp-client', config: { serverName, transport: 'stdio', command: 'npx' } },
    disabled,
    fiber: undefined,
  }
}

function makeService(
  entries: unknown[] = [mcpEntry('rea-mcp', 'rea')],
  updates: Array<{ id: string, options: unknown }> = [],
) {
  const instance = new Context()
  instance.provide('loader' as never, {
    entries: () => entries,
    update: async (id: string, options: unknown) => { updates.push({ id, options }) },
  } as never)
  instance.provide('tools' as never, { schemas: () => [] as unknown[] } as never)
  return new SkillMcpService(instance)
}

let home: string
let patch: string
const originalHome = process.env.DSH_HOME

beforeEach(async () => {
  home = await mkdtemp(join(tmpdir(), 'dsh-skill-mcp-center-'))
  await mkdir(join(home, 'profiles'), { recursive: true })
  patch = join(home, 'cordis.patch.yml')
  await writeFile(patch, PATCH, 'utf8')
  process.env.DSH_HOME = home
})

afterEach(async () => {
  if (originalHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = originalHome
  await rm(home, { recursive: true, force: true })
})

describe('MCP 永久禁用', () => {
  it('写入 disabled: true，与 name 同级，且保留注释与其余字段', async () => {
    const service = makeService()
    const result = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(result.changed).toBe(true)
    expect(result.file).toBe(patch)

    const text = await readFile(patch, 'utf8')
    expect(text).toContain('\n      disabled: true\n      name:')
    expect(text.startsWith('# 全局 patch 层')).toBe(true)
    expect(text).toContain('        serverName: rea')
  })

  it('写入后 listMcpServers 报告 permanentDisabled，且不再算「本次运行改过」', async () => {
    const updates: Array<{ id: string, options: unknown }> = []
    const service = makeService([mcpEntry('rea-mcp', 'rea')], updates)

    await service.setMcpServerEnabled('rea-mcp', false)
    expect((await service.listMcpServers())[0].sessionToggled).toBe(true)

    await service.setMcpPermanentDisabled('rea-mcp', true)
    const server = (await service.listMcpServers())[0]
    expect(server.permanentDisabled).toBe(true)
    // 持久化了就不再是「重启会恢复」的临时态。
    expect(server.sessionToggled).toBe(false)
    expect(updates.at(-1)).toEqual({ id: 'rea-mcp', options: { disabled: true } })
  })

  it('重复写入幂等：第二次 changed=false 且文件不变', async () => {
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)
    const once = await readFile(patch, 'utf8')

    const second = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(second.changed).toBe(false)
    expect(await readFile(patch, 'utf8')).toBe(once)
  })

  it('解除后文件字节级还原，并恢复热启用', async () => {
    const updates: Array<{ id: string, options: unknown }> = []
    const service = makeService([mcpEntry('rea-mcp', 'rea')], updates)
    await service.setMcpPermanentDisabled('rea-mcp', true)
    await service.setMcpPermanentDisabled('rea-mcp', false)

    expect(await readFile(patch, 'utf8')).toBe(PATCH)
    expect(updates.at(-1)).toEqual({ id: 'rea-mcp', options: { disabled: null } })
    expect((await service.listMcpServers())[0].permanentDisabled).toBe(false)
  })

  it('本来就没有 disabled 行时，解除是空操作', async () => {
    const service = makeService()
    const result = await service.setMcpPermanentDisabled('rea-mcp', false)
    expect(result.changed).toBe(false)
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('条目不在任何可写 patch 里（例如来自包内置 patch）时报错且不改文件', async () => {
    const service = makeService()
    await expect(service.setMcpPermanentDisabled('mcp-ghost', true)).rejects.toThrow(/not in any writable/)
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('CRLF 文件改完仍是 CRLF', async () => {
    const crlf = PATCH.replace(/\n/g, '\r\n')
    await writeFile(patch, crlf, 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)

    const text = await readFile(patch, 'utf8')
    expect(text).toContain('\r\n      disabled: true\r\n')
    expect(text.replace(/\r\n/g, '')).not.toContain('\n')
  })
})
