/**
 * 「永久禁用」的落盘语义：把 `disabled: true` 钉进 home 层 patch。
 *
 * 面板的开关只改内存树（宿主把 Loader 根树的 write 做成空实现），重启即恢复。
 * 这里钉住四件事：
 *
 * 1. 写的是 `$DSH_HOME/cordis.patch.yml`——它能覆盖所有层，且不受 profile-seed 改写。
 * 2. 只追加/删除顶格的 `- id:` 覆盖块，`insert` 子条目逐字节不动：真机上的
 *    `disabled:` 是 `!!js` 条件表达式，就地改写会毁掉那次求值。
 * 3. 解除后文件逐字节还原，CRLF 文件改完仍是 CRLF。
 * 4. 同 id 多次出现时改最后一个（`applyEntryPatches` 的 entryMap 是后者覆盖前者）。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'

import { SkillMcpService } from '../src/service.ts'

/** 真机形态：`insert` 子条目，`disabled` 是 `!!js` 条件表达式，带解释性注释。 */
const PATCH = `# Your patch layer for this dsh profile
- insert:
    - id: rea-mcp
      name: '@deepseek-ai/dsh-mcp-client'
      # CLI 缺失时停用：会让整棵插件树加载失败、内核起不来。
      disabled: !!js '!process.env.SSI_MCP_CLI'
      config:
        serverName: rea
        transport: stdio
        args:
          - rea.mjs
`

function mcpEntry(id: string, disabled = false) {
  return {
    id,
    options: { name: '@deepseek-ai/dsh-mcp-client', config: { serverName: 'rea', transport: 'stdio', command: 'npx' } },
    disabled,
    fiber: undefined,
  }
}

function makeService(
  entries: unknown[] = [mcpEntry('rea-mcp')],
  updates: Array<{ id: string, options: unknown }> = [],
  profilePatch?: string,
) {
  const instance = new Context()
  instance.provide('loader' as never, {
    entries: () => entries,
    create: async () => {},
    update: async (id: string, options: unknown) => { updates.push({ id, options }) },
  } as never)
  instance.provide('tools' as never, { schemas: () => [] as unknown[] } as never)
  if (profilePatch !== undefined) instance.provide('profileContext' as never, { patchPath: profilePatch } as never)
  return new SkillMcpService(instance)
}

let home: string
let patch: string
const originalHome = process.env.DSH_HOME

beforeEach(async () => {
  home = await mkdtemp(join(tmpdir(), 'dsh-skill-mcp-center-'))
  patch = join(home, 'cordis.patch.yml')
  process.env.DSH_HOME = home
})

afterEach(async () => {
  if (originalHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = originalHome
  await rm(home, { recursive: true, force: true })
})

describe('MCP 永久禁用：写入 home 层', () => {
  it('追加顶格覆盖，插入的 disable 与既有 ::js 子条目无关', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()

    const result = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(result).toEqual({ file: patch, disabled: true, changed: true })

    const text = await readFile(patch, 'utf8')
    // 原文件逐字保留 + 末尾多出两行覆盖
    expect(text).toBe(`${PATCH}- id: rea-mcp\n  disabled: true\n`)
    // `!!js` 表达式与注释一个字符都没变
    expect(text).toContain("disabled: !!js '!process.env.SSI_MCP_CLI'")
    expect(text).toContain('# CLI 缺失时停用：会让整棵插件树加载失败、内核起不来。')
  })

  it('home 层文件不存在时创建它', async () => {
    const service = makeService()
    const result = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(result.changed).toBe(true)
    expect(await readFile(patch, 'utf8')).toBe('- id: rea-mcp\n  disabled: true\n')
  })

  it('解除后文件逐字节还原', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)
    await service.setMcpPermanentDisabled('rea-mcp', false)
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('重复写入幂等：第二次 changed=false 且文件不变', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)
    const once = await readFile(patch, 'utf8')
    const second = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(second.changed).toBe(false)
    expect(await readFile(patch, 'utf8')).toBe(once)
  })

  it('本来就没有覆盖时，解除是空操作', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()
    const result = await service.setMcpPermanentDisabled('rea-mcp', false)
    expect(result.changed).toBe(false)
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('CRLF 文件改完仍是 CRLF', async () => {
    const crlf = PATCH.replace(/\n/g, '\r\n')
    await writeFile(patch, crlf, 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)

    const text = await readFile(patch, 'utf8')
    expect(text).toContain('\r\n- id: rea-mcp\r\n  disabled: true')
    expect(text.replace(/\r\n/g, '')).not.toContain('\n')
  })

  it('写入后报告 permanentDisabled，且不再算「本次运行改过」', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const updates: Array<{ id: string, options: unknown }> = []
    const service = makeService([mcpEntry('rea-mcp')], updates)

    await service.setMcpServerEnabled('rea-mcp', false)
    expect((await service.listMcpServers())[0].sessionToggled).toBe(true)

    await service.setMcpPermanentDisabled('rea-mcp', true)
    const card = (await service.listMcpServers())[0]
    expect(card.permanentDisabled).toBe(true)
    expect(card.sessionToggled).toBe(false)
    expect(updates.at(-1)).toEqual({ id: 'rea-mcp', options: { disabled: true } })
  })

  it('解除时热生效回启用', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const updates: Array<{ id: string, options: unknown }> = []
    const service = makeService([mcpEntry('rea-mcp', true)], updates)
    await service.setMcpPermanentDisabled('rea-mcp', false)
    expect(updates.at(-1)).toEqual({ id: 'rea-mcp', options: { disabled: null } })
  })
})

describe('MCP 永久禁用：定位', () => {
  it('行尾注释不影响定位', async () => {
    await writeFile(patch, `${PATCH}- id: rea-mcp # 这台机器的 rea\n`, 'utf8')
    const service = makeService()
    const result = await service.setMcpPermanentDisabled('rea-mcp', true)
    expect(result.changed).toBe(true)
    const text = await readFile(patch, 'utf8')
    expect(text).toContain('- id: rea-mcp # 这台机器的 rea\n  disabled: true')
  })

  it('同 id 多次出现时改最后一个（后者覆盖前者）', async () => {
    await writeFile(patch, [
      '- id: rea-mcp',
      '  disabled: true',
      '- id: rea-mcp',
      '  config:',
      '    serverName: rea',
      '',
    ].join('\n'), 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', true)
    const text = await readFile(patch, 'utf8')
    // 第一块原样保留，第二块被补上 disabled
    expect(text).toBe([
      '- id: rea-mcp',
      '  disabled: true',
      '- id: rea-mcp',
      '  disabled: true',
      '  config:',
      '    serverName: rea',
      '',
    ].join('\n'))
  })

  it('include: 前缀的运行时 id 用裸 id 写入', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService([mcpEntry('include:rea-mcp')])
    const result = await service.setMcpPermanentDisabled('include:rea-mcp', true)
    expect(result.changed).toBe(true)
    const text = await readFile(patch, 'utf8')
    expect(text).toContain('- id: rea-mcp\n  disabled: true')
    expect((await service.listMcpServers())[0].permanentDisabled).toBe(true)
  })

  it('嵌套 include 前缀逐层剥掉', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService([mcpEntry('include:sub:rea-mcp')])
    await service.setMcpPermanentDisabled('include:sub:rea-mcp', true)
    expect(await readFile(patch, 'utf8')).toContain('- id: rea-mcp\n  disabled: true')
  })

  it('带其他字段的覆盖块只删 disabled 行，不整块删', async () => {
    const original = '- id: rea-mcp\n  disabled: true\n  config:\n    serverName: rea\n'
    await writeFile(patch, original, 'utf8')
    const service = makeService()
    await service.setMcpPermanentDisabled('rea-mcp', false)
    const text = await readFile(patch, 'utf8')
    expect(text).toContain('config:')
    expect(text).not.toContain('disabled: true')
  })
})

describe('MCP 永久禁用：状态判定', () => {
  it('`!!js` 条件表达式既不算 permanentDisabled 也不算 pinnedInPatch', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()
    const card = (await service.listMcpServers())[0]
    expect(card.permanentDisabled).toBe(false)
    expect(card.pinnedInPatch).toBe(false)
  })

  it('手写在 insert 里的字面 disabled: true 只算 pinnedInPatch——面板不改它', async () => {
    // issue #6 作者按 workaround 手写的样子：面板读得出「重启后仍关」，但不能替他解除。
    const profileDir = join(home, 'profiles', 'desktop')
    await mkdir(profileDir, { recursive: true })
    const profilePatch = join(profileDir, 'cordis.patch.yml')
    const manual = "- insert:\n    - id: rea-mcp\n      disabled: true\n      name: '@deepseek-ai/dsh-mcp-client'\n"
    await writeFile(profilePatch, manual, 'utf8')

    const service = makeService([mcpEntry('include:rea-mcp', true)], [], profilePatch)
    const card = (await service.listMcpServers())[0]
    expect(card.pinnedInPatch).toBe(true)
    expect(card.permanentDisabled).toBe(false)

    // 解除不会去改 insert 子条目，也不会凭空建 home 层
    const result = await service.setMcpPermanentDisabled('include:rea-mcp', false)
    expect(result.changed).toBe(false)
    expect(await readFile(profilePatch, 'utf8')).toBe(manual)
    await expect(readFile(join(home, 'cordis.patch.yml'), 'utf8')).rejects.toThrow()
  })

  it('profile 层的顶格覆盖只算 pinnedInPatch——面板只写 home 层', async () => {
    // profile 里的 `- id: x / disabled: true` 是持久禁用，但解除只删 home 层的块：
    // 把它报成面板可解除，会给一个点了没反应的按钮。
    const profileDir = join(home, 'profiles', 'ssid')
    await mkdir(profileDir, { recursive: true })
    const profilePatch = join(profileDir, 'cordis.patch.yml')
    const manual = '- id: rea-mcp\n  disabled: true\n'
    await writeFile(profilePatch, manual, 'utf8')

    const service = makeService([mcpEntry('include:rea-mcp', true)], [], profilePatch)
    const card = (await service.listMcpServers())[0]
    expect(card.pinnedInPatch).toBe(true)
    expect(card.permanentDisabled).toBe(false)

    // 面板不代改 profile，也不凭空建 home 层
    const result = await service.setMcpPermanentDisabled('include:rea-mcp', false)
    expect(result.changed).toBe(false)
    expect(await readFile(profilePatch, 'utf8')).toBe(manual)
    await expect(readFile(join(home, 'cordis.patch.yml'), 'utf8')).rejects.toThrow()
  })

  it('home 层的顶格覆盖才是面板可解除的那种', async () => {
    await writeFile(patch, '- id: rea-mcp\n  disabled: true\n', 'utf8')
    const service = makeService([mcpEntry('rea-mcp', true)])
    const card = (await service.listMcpServers())[0]
    expect(card.permanentDisabled).toBe(true)
    expect(card.pinnedInPatch).toBe(true)

    const result = await service.setMcpPermanentDisabled('rea-mcp', false)
    expect(result.changed).toBe(true)
    expect(await readFile(patch, 'utf8')).toBe('')
  })

  it('当前 profile 层钉的禁用也能读到', async () => {
    const profileDir = join(home, 'profiles', 'ssid')
    await mkdir(profileDir, { recursive: true })
    const profilePatch = join(profileDir, 'cordis.patch.yml')
    await writeFile(profilePatch, '- insert:\n    - id: rea-mcp\n      disabled: true\n', 'utf8')
    await writeFile(patch, PATCH, 'utf8')

    const service = makeService([mcpEntry('rea-mcp')], [], profilePatch)
    expect((await service.listMcpServers())[0].pinnedInPatch).toBe(true)
  })

  it('home 层覆盖 profile 层（later wins）', async () => {
    const profileDir = join(home, 'profiles', 'ssid')
    await mkdir(profileDir, { recursive: true })
    const profilePatch = join(profileDir, 'cordis.patch.yml')
    await writeFile(profilePatch, '- insert:\n    - id: rea-mcp\n      disabled: true\n', 'utf8')
    await writeFile(patch, '- id: rea-mcp\n  disabled: false\n', 'utf8')

    const service = makeService([mcpEntry('rea-mcp')], [], profilePatch)
    expect((await service.listMcpServers())[0].permanentDisabled).toBe(false)
  })
})

describe('MCP 永久禁用：边界', () => {
  it('面板本次运行新建的条目报错，且不写文件', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const entries: unknown[] = []
    const service = makeService(entries)
    const { id } = await service.createMcpServer({ serverName: 'fresh', transport: 'stdio', command: 'npx' } as never)
    entries.push(mcpEntry(id))

    await expect(service.setMcpPermanentDisabled(id, true)).rejects.toThrow('mcp-permanent-created-this-run')
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('不存在于内存树的 id 报错，且不写文件', async () => {
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService()
    await expect(service.setMcpPermanentDisabled('mcp-ghost', true)).rejects.toThrow('mcp-permanent-no-entry')
    expect(await readFile(patch, 'utf8')).toBe(PATCH)
  })

  it('来自 bundle 内置 patch 的条目也能钉住（home 层覆盖得着）', async () => {
    // 条目不在任何可写文件里，只在内存树（模拟 bundle 层提供）
    await writeFile(patch, PATCH, 'utf8')
    const service = makeService([mcpEntry('bundled-mcp')])
    const result = await service.setMcpPermanentDisabled('bundled-mcp', true)
    expect(result.changed).toBe(true)
    expect(await readFile(patch, 'utf8')).toContain('- id: bundled-mcp\n  disabled: true')
  })
})
