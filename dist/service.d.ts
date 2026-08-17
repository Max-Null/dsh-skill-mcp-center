/**
 * `SkillMcpService` — the process-local composition of skill and MCP
 * management. Skills are read through `ctx.skills` (toggled via the
 * `disable-model-invocation` frontmatter on SKILL.md); MCP servers are the
 * `mcp-client` loader entries, managed hot through `ctx.loader` and observed
 * through a feature-detected `ctx.mcpStatus` seam with a derived fallback.
 */
import { Service, type Context } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** The skill/MCP center engine (provided by this package's host half). */
        skillMcp: SkillMcpService;
    }
}
/** One skill as the Settings surface exposes it. */
export interface SkillView {
    name: string;
    description: string;
    source: string;
    provider: string;
    modelInvocable: boolean;
    userInvocable: boolean;
    /** Whether the toggle is available (disk-backed and outside the read-only tiers). */
    writable: boolean;
}
/** One MCP server as the Settings surface exposes it. */
export interface McpServer {
    id: string;
    serverName: string;
    transport: 'stdio' | 'streamable-http';
    command?: string;
    args?: string[];
    cwd?: string;
    url?: string;
    headers?: Record<string, string>;
    disabled: boolean;
    fiberPhase: string | null;
}
/** Runtime status of one MCP server (sidebar polling). */
export interface McpServerStatus {
    serverName: string;
    fiberPhase: string | null;
    toolCount: number;
    connected: boolean;
    statusSource: 'seam' | 'derived';
}
/** Client-supplied MCP server config, normalized to the mcp-client shape. */
export interface McpConfig {
    serverName: string;
    transport: 'stdio' | 'streamable-http';
    command?: string;
    args?: string[];
    cwd?: string;
    url?: string;
    headers?: Record<string, string>;
}
export declare class SkillMcpService extends Service {
    static inject: string[];
    constructor(ctx: Context);
    /** All skills the deployment sees, with resolved invocation + writable flag. */
    listSkills(): Promise<SkillView[]>;
    /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
    toggleSkill(name: string): Promise<SkillView>;
    /** Every `mcp-client` loader entry as a server card. */
    listMcpServers(): Promise<McpServer[]>;
    /** Add one mcp-client entry — hot-connects (create → init) and persists. */
    createMcpServer(config: McpConfig): Promise<{
        id: string;
    }>;
    /** Rewrite one server's config — hot-updates the running fiber. */
    updateMcpServer(id: string, config: McpConfig): Promise<void>;
    /** Remove one server — disconnects and unregisters its tools. */
    removeMcpServer(id: string): Promise<void>;
    /** Enable/disable one server without deleting its config. */
    setMcpServerEnabled(id: string, enabled: boolean): Promise<void>;
    /** Runtime status per server: upstream `mcpStatus` seam when present, else derived. */
    mcpStatus(): Promise<McpServerStatus[]>;
}
export default SkillMcpService;
