/**
 * `SkillMcpService` — the process-local composition of skill and MCP
 * management. Skills are read straight off disk (host-level skill-filesystem
 * is disabled in web-app — presets own discovery — so `ctx.skills` has no
 * global layer to list); MCP servers are the `mcp-client` loader entries,
 * managed hot through `ctx.loader` and observed through a feature-detected
 * `ctx.mcpStatus` seam with a derived fallback.
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
    /** Always true — user-level skills are disk-backed and toggleable. */
    writable: boolean;
    /** Absolute SKILL.md path (the toggle target; opaque to the client display). */
    path: string;
}
/** Plugin configuration for the skill/MCP engine. */
export interface SkillConfig {
    /** Additional read-only official/bundled skill roots (e.g. the harness repo's own `.agents/skills`). */
    officialSkillDirs?: string[];
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
/** One tool a server contributes, as the management surface lists it. */
export interface McpToolView {
    name: string;
    description: string;
}
/** Runtime status of one MCP server (sidebar polling). */
export interface McpServerStatus {
    serverName: string;
    fiberPhase: string | null;
    toolCount: number;
    /**
     * The tools themselves. A bare count says nothing about what the server
     * actually offers, so the surface lists names and descriptions too
     * (2026-09-14 用户：MCP 的 tools 信息太少了，最好有名称和介绍）。
     * Names come from `tools.schemas()`, which whitelists name/description.
     */
    tools: McpToolView[];
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
    private readonly officialSkillDirs;
    constructor(ctx: Context, config?: SkillConfig);
    /**
     * Skill roots that live **inside loaded plugin packages**, i.e.
     * `<node_modules>/<pkg>/skills`.
     *
     * The host-level skill filesystem is disabled in web-app (presets own
     * discovery), so a plugin that ships skills — `@max-null/dsh-skills` and
     * `@max-null/dsh-plugin-center` both do — keeps them on disk inside its own
     * package, where no user-level root can see them. Without this the
     * management surface showed 17 user skills while 8 plugin skills were loaded
     * and in effect (2026-09-14 用户报「skill 生效但不展示」).
     *
     * Only **loaded** entries are probed, so this costs one existence check per
     * plugin rather than a scan of the whole node_modules tree.
     */
    private pluginSkillDirs;
    /**
     * User-level skills, project-level skills for the given workspace, skills
     * bundled inside loaded plugin packages, and any configured official roots.
     */
    listSkills(cwd?: string): Promise<SkillView[]>;
    /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
    toggleSkill(path: string): Promise<SkillView>;
    /**
     * Read one skill's SKILL.md raw text for display. Paths must live under a
     * known skill root — a plain path join against the same roots `listSkills`
     * scans, so the RPC cannot be used to read arbitrary files.
     */
    readSkill(path: string, cwd?: string): Promise<string>;
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
