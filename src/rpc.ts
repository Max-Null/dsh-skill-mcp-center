/**
 * `SkillMcpRpc` — the host half of the browser's private RPC entry point.
 *
 * Transport (2026-09-17). Two host shapes are supported because the two
 * compositions this plugin runs under differ:
 *
 * - **Newer hosts (0.1.5 line, e.g. the web source build)** expose
 *   `connection.fetch.register(...)`. This route is used there because
 *   `connection.rpc.handle('/skill-mcp', …)` ends at `owner.webServer.register()`
 *   inside Connection (`client-connection/src/rpc-host.ts:179`) and the owning
 *   fiber declares no `webServer` injection, so it throws
 *   `cannot get property "webServer" without inject`; every channel registered
 *   that way fails and the browser sees `HTTP 405` from the static fallback.
 *   `fetch.register` only writes Connection's own route map, so one exact route
 *   under the shared `/api` channel serves the same endpoints.
 *
 * - **Older hosts (e.g. the packaged SSiD kernel)** expose only the logical
 *   channel registry, where `rpc.handle` works, so it stays as the fallback.
 *
 * `connection` is resolved with `ctx.inject` rather than a declared dependency:
 * it activates after this plugin, and `ctx.plugin()` does not wait for
 * dependencies.
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import type { RpcResult } from '@deepseek-ai/dsh-host-apiproxy/api'

/** Exact Fetch route serving this plugin's endpoints under the shared channel. */
export const ROUTE = '/api/skill-mcp'

/** Logical channel used on hosts without exact Fetch-route registration. */
export const LEGACY_CHANNEL = '/skill-mcp'

/** Body the browser half posts to {@link ROUTE}. */
export interface SkillMcpRequest {
  /** Endpoint name, e.g. `listSkills`. */
  readonly endpoint: string
  /** Endpoint arguments. */
  readonly payload?: unknown
}

/**
 * Connection host surface this plugin needs. Declared locally because the
 * published peer types (`^0.1.1-rc.1`) predate `fetch`; every member is
 * feature-detected before use.
 */
interface ConnectionHostSurface {
  readonly fetch?: {
    register(route: {
      readonly path: string
      readonly methods: readonly ('GET' | 'HEAD' | 'POST')[]
      readonly requestBody: 'buffered' | 'streaming'
      readonly fetch: (request: Request) => Promise<Response>
    }): () => Promise<void>
  }
  readonly rpc: {
    handle(
      channel: string,
      handler: (endpoint: string, payload: unknown) => Promise<RpcResult<unknown>>,
    ): () => Promise<void>
  }
}

function internal(message: string): RpcResult<unknown> {
  return { ok: false, error: { code: 'internal', message, details: {} } }
}

/**
 * Wrap one endpoint result as a JSON response.
 * @param value - RPC result envelope.
 * @returns response carrying the envelope.
 */
function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } })
}

export class SkillMcpRpc extends Service {
  static inject = ['skillMcp']

  /**
   * @param ctx - plugin context carrying the skill/MCP engine.
   */
  constructor(ctx: Context) {
    super(ctx, 'skillMcpRpc')
    ctx.inject(['connection'], (connectionCtx) => {
      // Both reads are attempted: the published peer types predate the
      // `connection` declaration on Context, so neither is typed here.
      const surface = connectionCtx as unknown as {
        connection?: ConnectionHostSurface
        get?: (name: string) => unknown
      }
      const connection = surface.connection ?? (surface.get?.('connection') as ConnectionHostSurface | undefined)
      if (connection === undefined) return
      if (typeof connection.fetch?.register === 'function') {
        connection.fetch.register({
          path: ROUTE,
          methods: ['POST'],
          requestBody: 'buffered',
          fetch: async (request: Request): Promise<Response> => {
            let body: SkillMcpRequest
            try {
              body = await request.json() as SkillMcpRequest
            } catch {
              return jsonResponse(internal('request body must be JSON'))
            }
            return jsonResponse(await dispatch(ctx, body))
          },
        })
        return
      }
      connection.rpc.handle(
        LEGACY_CHANNEL,
        (endpoint: string, payload: unknown) => dispatch(ctx, { endpoint, payload }),
      )
    })
  }
}

/**
 * Run one endpoint against the engine.
 * @param ctx - plugin context carrying the skill/MCP engine.
 * @param body - decoded request body.
 * @returns the endpoint result, or an `internal` failure.
 */
async function dispatch(ctx: Context, body: SkillMcpRequest): Promise<RpcResult<unknown>> {
  try {
    const p = (body.payload ?? {}) as Record<string, unknown>
    switch (body.endpoint) {
      case 'listSkills': {
        const cwd = p.cwd
        return { ok: true, value: await ctx.skillMcp.listSkills(typeof cwd === 'string' ? cwd : undefined) }
      }
      case 'toggleSkill': {
        const path = p.path
        if (typeof path !== 'string' || path === '') return internal('toggleSkill: path is required')
        return { ok: true, value: await ctx.skillMcp.toggleSkill(path) }
      }
      case 'readSkill': {
        const path = p.path
        if (typeof path !== 'string' || path === '') return internal('readSkill: path is required')
        const cwd = p.cwd
        return { ok: true, value: await ctx.skillMcp.readSkill(path, typeof cwd === 'string' ? cwd : undefined) }
      }
      case 'listMcpServers':
        return { ok: true, value: await ctx.skillMcp.listMcpServers() }
      case 'createMcpServer':
        return { ok: true, value: await ctx.skillMcp.createMcpServer(p.config as never) }
      case 'updateMcpServer':
        return { ok: true, value: await ctx.skillMcp.updateMcpServer(String(p.id), p.config as never) }
      case 'removeMcpServer':
        return { ok: true, value: await ctx.skillMcp.removeMcpServer(String(p.id)) }
      case 'setMcpServerEnabled':
        return { ok: true, value: await ctx.skillMcp.setMcpServerEnabled(String(p.id), p.enabled === true) }
      case 'mcpStatus':
        return { ok: true, value: await ctx.skillMcp.mcpStatus() }
      default:
        return internal(`unknown endpoint "${body.endpoint}"`)
    }
  } catch (error) {
    return internal(error instanceof Error ? error.message : String(error))
  }
}

export default SkillMcpRpc
