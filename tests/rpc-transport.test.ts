import { describe, expect, it, vi } from 'vitest'

// cordis 的 Service 基类在构造时会访问真实 ctx 的根作用域（provide）。
// 本套测试关心的是「传输层怎么选、路由怎么派发」，不是 cordis 的生命周期，
// 所以把基类换成只吞构造参数的替身。
vi.mock('@deepseek-ai/cordis', () => ({
  Service: class {
    constructor(_ctx: unknown, _name: string) {}
  },
}))

import { SkillMcpRpc } from '../src/rpc.ts'

/**
 * 只记录注册动作的假 ctx：`inject` 把回调存起来，测试再手工把「晚到的」
 * connection 服务递进去——真实运行里它就是这个时序（见 rpc.ts 顶部注释）。
 */
function harness() {
  const fetchRoutes: Array<{
    path: string
    methods: readonly string[]
    requestBody: string
    fetch: (request: Request) => Promise<Response>
  }> = []
  const channels: string[] = []
  let callback: ((ctx: unknown) => void) | undefined
  const ctx = {
    inject: (_deps: readonly string[], cb: (c: unknown) => void) => { callback = cb },
    skillMcp: {
      listSkills: async () => [{ name: 'demo-skill' }],
    },
  }
  return {
    ctx,
    fetchRoutes,
    channels,
    /** 触发 inject 回调，模拟 connection 服务就绪。 */
    connect: (connection: unknown) => { callback?.({ connection }) },
    /** 新宿主：有 fetch.register。 */
    newHost: () => ({
      fetch: {
        register: (route: (typeof fetchRoutes)[number]) => { fetchRoutes.push(route); return async () => {} },
      },
      rpc: { handle: (channel: string) => { channels.push(channel); return async () => {} } },
    }),
    /** 老宿主：只有逻辑通道注册表。 */
    legacyHost: () => ({
      rpc: { handle: (channel: string) => { channels.push(channel); return async () => {} } },
    }),
  }
}

/** 构造一次到新路由的 POST。 */
function post(body: unknown): Request {
  return new Request('http://127.0.0.1/api/skill-mcp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('SkillMcpRpc 传输层选择', () => {
  it('宿主支持 connection.fetch → 注册 /api/skill-mcp 精确路由，不走 rpc.handle', () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    h.connect(h.newHost())

    expect(h.fetchRoutes).toHaveLength(1)
    expect(h.fetchRoutes[0]?.path).toBe('/api/skill-mcp')
    expect(h.fetchRoutes[0]?.methods).toEqual(['POST'])
    expect(h.fetchRoutes[0]?.requestBody).toBe('buffered')
    expect(h.channels).toHaveLength(0)
  })

  it('宿主无 fetch → 回退逻辑通道 /skill-mcp，不注册路由', () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    h.connect(h.legacyHost())

    expect(h.channels).toEqual(['/skill-mcp'])
    expect(h.fetchRoutes).toHaveLength(0)
  })

  it('connection 服务缺失 → 不注册也不抛错（等不到服务不等于崩溃）', () => {
    const h = harness()
    expect(() => {
      new SkillMcpRpc(h.ctx as never)
      h.connect(undefined)
    }).not.toThrow()
    expect(h.fetchRoutes).toHaveLength(0)
    expect(h.channels).toHaveLength(0)
  })

  it('fetch 到位前不会抢先注册（服务晚于插件激活）', () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    // 尚未 connect：此刻连接服务还没到
    expect(h.fetchRoutes).toHaveLength(0)
    expect(h.channels).toHaveLength(0)
  })
})

describe('SkillMcpRpc 路由行为', () => {
  it('{endpoint,payload} → 派发到引擎并回 RpcResult 信封', async () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    h.connect(h.newHost())
    const route = h.fetchRoutes[0]
    expect(route).toBeDefined()

    const response = await route!.fetch(post({ endpoint: 'listSkills', payload: {} }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, value: [{ name: 'demo-skill' }] })
  })

  it('请求体不是 JSON → internal 失败信封，而不是抛错', async () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    h.connect(h.newHost())
    const route = h.fetchRoutes[0]

    const response = await route!.fetch(post('not-json'))
    const body = await response.json() as { ok: boolean; error?: { code?: string } }
    expect(response.status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.error?.code).toBe('internal')
  })

  it('未知 endpoint → internal 失败信封', async () => {
    const h = harness()
    new SkillMcpRpc(h.ctx as never)
    h.connect(h.newHost())
    const route = h.fetchRoutes[0]

    const response = await route!.fetch(post({ endpoint: 'nope', payload: {} }))
    const body = await response.json() as { ok: boolean; error?: { message?: string } }
    expect(body.ok).toBe(false)
    expect(body.error?.message).toContain('unknown endpoint')
  })

  it('引擎抛错 → 收敛成 internal 失败信封（不冒泡成 500）', async () => {
    const h = harness()
    const thrown = {
      inject: h.ctx.inject,
      skillMcp: { listSkills: async () => { throw new Error('engine exploded') } },
    }
    new SkillMcpRpc(thrown as never)
    h.connect(h.newHost())
    const route = h.fetchRoutes[0]

    const response = await route!.fetch(post({ endpoint: 'listSkills', payload: {} }))
    const body = await response.json() as { ok: boolean; error?: { message?: string } }
    expect(response.status).toBe(200)
    expect(body.ok).toBe(false)
    expect(body.error?.message).toBe('engine exploded')
  })
})
