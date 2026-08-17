/**
 * `dsh-skill-mcp-center` host half: mounts the skill/MCP engine and its
 * loopback RPC. The browser half (`./client`) is picked up through the
 * package's `dsh.client` declaration.
 */
import type { Context } from '@deepseek-ai/cordis';
export { SkillMcpService } from './service.ts';
export type { McpConfig, McpServer, McpServerStatus, SkillView } from './service.ts';
export declare const name = "dsh-skill-mcp-center";
/** The engine declares its own loader/tools dependencies. */
export declare const inject: string[];
export declare function apply(ctx: Context): Promise<void>;
