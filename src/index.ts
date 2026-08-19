/**
 * `dsh-skill-mcp-center` host half: mounts the skill/MCP engine and its
 * loopback RPC. The browser half (`./client`) is picked up through the
 * package's `dsh.client` declaration.
 */
import type { Context } from '@deepseek-ai/cordis'
import { SkillMcpService } from './service.ts'
import { SkillMcpRpc } from './rpc.ts'
import type { SkillConfig } from './service.ts'

export { SkillMcpService } from './service.ts'
export type { McpConfig, McpServer, McpServerStatus, SkillConfig, SkillView } from './service.ts'

export const name = 'dsh-skill-mcp-center'

/** The engine declares its own loader/tools dependencies. */
export const inject = ['loader', 'tools']

export async function apply(ctx: Context, config: SkillConfig = {}): Promise<void> {
  await ctx.plugin(SkillMcpService, config)
  await ctx.plugin(SkillMcpRpc)
}
