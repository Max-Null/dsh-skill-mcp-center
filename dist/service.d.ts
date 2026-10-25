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
    /** False when the panel disabled this skill; a runtime placeholder shadows the real definition. */
    enabled: boolean;
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
    /**
     * True when the switch was changed during this run. Lets the panel say
     * "reverted on restart" only where that is true — an entry disabled in
     * `cordis.patch.yml` stays disabled across restarts and must not be
     * labelled as session-only.
     */
    sessionToggled: boolean;
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
/**
 * Scan one root for SKILL.md entries and parse their frontmatter.
 * @param root - directory to scan; a missing root yields no skills.
 * @param source - discovery source label recorded on every skill found.
 * @param writable - whether the surface may rewrite these SKILL.md files.
 * @param provider - provider label recorded on every skill found.
 * @returns the skills this root contributes, in directory order.
 */
export declare function scanSkillRoot(root: string, source: string, writable?: boolean, provider?: string): Promise<SkillView[]>;
/** The loader-entry fields plugin skill discovery reads. */
export interface SkillRootEntry {
    readonly options: {
        readonly id: string;
        readonly name: string;
    };
    /** Absent while the entry is disabled, incompatible, or still loading. */
    readonly fiber?: {
        readonly config: unknown;
    } | undefined;
}
/**
 * Skill roots contributed by loaded plugin packages.
 *
 * Two declarations reach such a directory, and both are needed:
 *
 * - the entry's module specifier, i.e. `<node_modules>/<pkg>/skills` — how
 *   `@max-null/dsh-skills` and `@max-null/dsh-plugin-center` ship theirs;
 * - the entry's own `bundledSkillDir` config — the only way to see a plugin
 *   that mounts the official `@deepseek-ai/dsh-skill-filesystem` under an id
 *   of its own. `dsh-plugin-zhihu-search` is the live sample: it registers
 *   `name: '@deepseek-ai/dsh-skill-filesystem'`, and its `skills/` sits in a
 *   different `node_modules` tree than this plugin's.
 *
 * `bundledSkillDir` is read from the **fiber**, never from
 * `entry.options.config`. A patch may compute the value with a `!!js`
 * expression, and the Loader keeps that expression as a `{ __jsExpr }` node
 * in the stored options while handing the owning fiber the evaluated copy —
 * it interpolates on the `internal/config` waterfall and writes the raw node
 * back on `internal/update` specifically so file write-back preserves the
 * `!!js` form. The stored value is therefore an expression node rather than a
 * path, and reading it can only miss.
 *
 * Only **loaded** entries are probed, so this costs a couple of existence
 * checks per plugin instead of a scan of the whole `node_modules` tree.
 * @param entries - loaded loader entries.
 * @param nodeModules - this package's own `node_modules` tree, or null.
 * @returns the skill roots that exist, deduplicated, in entry order.
 */
export declare function pluginSkillRoots(entries: Iterable<SkillRootEntry>, nodeModules: string | null): {
    dir: string;
    label: string;
}[];
/**
 * Resolve the entry one deletion removes, or reject the request.
 *
 * `path` is a SKILL.md path as `listSkills` reported it. A bundle
 * (`<root>/<name>/SKILL.md`) is removed as its directory; a flat file
 * (`<root>/<name>.md`) as itself.
 *
 * The entry must be a **direct child** of one of `roots`. Direct-child
 * placement, rather than a prefix check, is what keeps this from being aimed
 * at a root itself, at a nested reference file inside a skill, or at anything
 * under a plugin package — those roots are not in the list to begin with.
 * @param path - candidate SKILL.md path.
 * @param roots - roots a deletion may target.
 * @returns the absolute entry to remove.
 * @throws {Error} `skill-not-found` when the path is not a skill entry sitting directly under an allowed root.
 */
export declare function deleteTargetOf(path: string, roots: readonly string[]): string;
export declare class SkillMcpService extends Service {
    static inject: string[];
    private readonly officialSkillDirs;
    /** Ids toggled by the panel during this run (in-memory only, by design: the host does not persist it). */
    private readonly sessionToggled;
    /** Skill names the panel disabled; runtime placeholders shadow the real definitions. */
    private readonly skillsDisabled;
    /** Live disposers for those shadow registrations, keyed by skill name. */
    private readonly shadowDisposers;
    /** Set once the disabled list has been read from disk and replayed. */
    private shadowsLoaded;
    constructor(ctx: Context, config?: SkillConfig);
    /**
     * Skill roots that live **inside loaded plugin packages**.
     *
     * The host-level skill filesystem is disabled in web-app (presets own
     * discovery), so a plugin that ships skills — `@max-null/dsh-skills` and
     * `@max-null/dsh-plugin-center` both do — keeps them on disk inside its own
     * package, where no user-level root can see them. Without this the
     * management surface showed 17 user skills while 8 plugin skills were loaded
     * and in effect (2026-09-14 用户报「skill 生效但不展示」).
     */
    private pluginSkillDirs;
    /**
     * User-level skills, project-level skills for the given workspace, skills
     * bundled inside loaded plugin packages, and any configured official roots.
     */
    listSkills(cwd?: string): Promise<SkillView[]>;
    /**
     * 补上「运行时注册」的 skill：`ctx.skills.register()` 注册的条目没有 SKILL.md，
     * 磁盘扫描（本项目的主要取数方式）看不到它们——dsh-jubensha 的 DM 手册、office、
     * genui 都属于这一类。用户因此报了「面板少了很多 skill」。
     *
     * skills 服务是**可选**的：web-app 宿主把它关掉（presets 拥有发现，没有全局层可列），
     * 所以这里 feature-detect，拿不到就原样返回空，不改变既有行为。
     * 这些条目没有可写的 SKILL.md，标成 `writable: false`——开关对它们没有意义。
     */
    private runtimeOnlySkills;
    /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
    toggleSkill(path: string): Promise<SkillView>;
    /**
     * Read one skill's SKILL.md raw text for display. Paths must live under a
     * known skill root — a plain path join against the same roots `listSkills`
     * scans, so the RPC cannot be used to read arbitrary files.
     */
    readSkill(path: string, cwd?: string): Promise<string>;
    /**
     * Delete one user-level or project-level skill.
     *
     * The entry is **moved**, not unlinked: a mistaken deletion lands in
     * `<home>/.dsh/.skill-trash/` and stays recoverable, and the destination is
     * returned so the surface can tell the user where it went. Plugin packages
     * and the official bundled roots are not candidates — see
     * {@link deletableRoots}.
     * @param path - absolute SKILL.md path, as `listSkills` reported it.
     * @param cwd - session workspace, when the caller has one.
     * @returns the trash path the skill was moved to.
     * @throws {Error} `skill-not-found` when the path is not deletable; `skill-delete-failed` when the move fails.
     */
    deleteSkill(path: string, cwd?: string): Promise<{
        trashPath: string;
    }>;
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
    /** Enable/disable one server without deleting its config. The host does not persist this. */
    setMcpServerEnabled(id: string, enabled: boolean): Promise<void>;
    /** 技能禁用清单的落盘位置：跟在 DSH_HOME 下，隔离实例各自一份。 */
    private disabledFile;
    /**
     * 读回落盘的禁用清单并重放遮蔽。为什么要自己存：registry 不提供「查看被遮蔽定义」的
     * API（`The registry still exposes no API to inspect shadowed definitions`），
     * 不落盘的话重启即失忆，面板开关就成了一次性的。
     */
    private loadDisabledSkills;
    private persistDisabledSkills;
    /**
     * 停用一条技能：注册同名占位——runtime rank（250）赢过包内 provider（≈550）与 bundled（600），
     * 两个 invocation 都为 false，于是模型和人都调不到它，但它仍在 catalog 里、可被面板列出。
     * 这是包内技能**唯一**可逆的停用方式：改名 / 移目录 / 断链对安装内容都不生效。
     */
    private applyShadow;
    private removeShadow;
    /** 启用/停用一条技能。停用走占位遮蔽、启用调 disposer——不写 SKILL.md、不重启。 */
    setSkillEnabled(name: string, enabled: boolean): Promise<void>;
    /** Runtime status per server: upstream `mcpStatus` seam when present, else derived. */
    mcpStatus(): Promise<McpServerStatus[]>;
}
export default SkillMcpService;
