/**
 * `SkillMcpService` — the process-local composition of skill and MCP
 * management. Skills are read straight off disk (host-level skill-filesystem
 * is disabled in web-app — presets own discovery — so `ctx.skills` has no
 * global layer to list); MCP servers are the `mcp-client` loader entries,
 * managed hot through `ctx.loader` and observed through a feature-detected
 * `ctx.mcpStatus` seam with a derived fallback.
 */
import { Service } from '@deepseek-ai/cordis';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, sep } from 'node:path';
import { parseSkillFrontmatter, setDisableModelInvocation } from "./frontmatter.js";
/** Runtime mirror of cordis FiberState (a cross-package const enum). */
const FIBER_PHASE = {
    0: 'pending',
    1: 'loading',
    2: 'active',
    3: 'failed',
    4: null,
    5: 'unloading',
};
/** Normalize a client MCP config into the full mcp-client config (defaults filled). */
function fullMcpConfig(input) {
    if (input.transport === 'stdio') {
        return {
            transport: 'stdio',
            serverName: input.serverName,
            command: input.command ?? '',
            args: input.args ?? [],
            env: {},
            cwd: input.cwd ?? '',
            toolCallTimeoutMs: 60_000,
            failOnStartupError: false,
        };
    }
    return {
        transport: 'streamable-http',
        serverName: input.serverName,
        url: input.url ?? '',
        headers: input.headers ?? {},
        toolCallTimeoutMs: 60_000,
        failOnStartupError: false,
    };
}
/** User-level skill roots (host-level filesystem discovery is preset-owned in web). */
const SKILL_ROOTS = [
    { path: join(homedir(), '.dsh', 'skills'), source: 'user-dsh' },
    { path: join(homedir(), '.agents', 'skills'), source: 'user-agents' },
];
/** Absolute SKILL.md path for one directory/file entry, or null. */
function skillPathFor(root, name, isDirectory) {
    if (isDirectory)
        return join(root, name, 'SKILL.md');
    if (name.endsWith('.md'))
        return join(root, name);
    return null;
}
/** Scan one root for SKILL.md entries and parse their frontmatter. */
async function scanSkillRoot(root, source, writable = true, provider = 'filesystem') {
    let entries;
    try {
        entries = await readdir(root, { withFileTypes: true });
    }
    catch {
        return []; // root absent
    }
    const skills = [];
    for (const entry of entries) {
        const skillPath = skillPathFor(root, entry.name, entry.isDirectory());
        if (skillPath === null)
            continue;
        let text;
        try {
            text = await readFile(skillPath, 'utf8');
        }
        catch {
            continue;
        }
        const fm = parseSkillFrontmatter(text);
        if (fm === null)
            continue;
        skills.push({
            name: fm.name,
            description: fm.description,
            source,
            provider,
            modelInvocable: fm.modelInvocable,
            userInvocable: true,
            writable,
            path: skillPath,
        });
    }
    return skills;
}
export class SkillMcpService extends Service {
    static inject = ['loader', 'tools'];
    officialSkillDirs;
    constructor(ctx, config = {}) {
        super(ctx, 'skillMcp');
        this.officialSkillDirs = config.officialSkillDirs ?? [];
    }
    /** User-level skills plus, when a workspace is given, its project-level skills. */
    async listSkills(cwd) {
        const skills = [];
        for (const root of SKILL_ROOTS) {
            skills.push(...await scanSkillRoot(root.path, root.source));
        }
        if (cwd !== undefined && cwd !== '') {
            skills.push(...await scanSkillRoot(join(cwd, '.agents', 'skills'), 'project-agents'));
            skills.push(...await scanSkillRoot(join(cwd, '.dsh', 'skills'), 'project-dsh'));
        }
        for (const dir of this.officialSkillDirs) {
            skills.push(...await scanSkillRoot(dir, 'bundled', false, 'dsh-official'));
        }
        return skills;
    }
    /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
    async toggleSkill(path) {
        let text;
        try {
            text = await readFile(path, 'utf8');
        }
        catch {
            throw new Error('skill-not-found');
        }
        const fm = parseSkillFrontmatter(text);
        if (fm === null)
            throw new Error('skill-not-found');
        // Currently model-invocable → disable.
        await writeFile(path, setDisableModelInvocation(text, fm.modelInvocable), 'utf8');
        return {
            name: fm.name,
            description: fm.description,
            source: 'user',
            provider: 'filesystem',
            modelInvocable: !fm.modelInvocable,
            userInvocable: true,
            writable: true,
            path,
        };
    }
    /**
     * Read one skill's SKILL.md raw text for display. Paths must live under a
     * known skill root — a plain path join against the same roots `listSkills`
     * scans, so the RPC cannot be used to read arbitrary files.
     */
    async readSkill(path, cwd) {
        const roots = [...SKILL_ROOTS.map(root => root.path)];
        if (cwd !== undefined && cwd !== '') {
            roots.push(join(cwd, '.agents', 'skills'), join(cwd, '.dsh', 'skills'));
        }
        roots.push(...this.officialSkillDirs);
        // Segment-boundary prefix check: a sibling directory like `skills-notes`
        // must not satisfy a `skills` root. join(root, '') normalizes to root.
        if (!roots.some(root => path === root || path.startsWith(`${root}${sep}`)))
            throw new Error('skill-not-found');
        let text;
        try {
            text = await readFile(path, 'utf8');
        }
        catch {
            throw new Error('skill-not-found');
        }
        return text;
    }
    /** Every `mcp-client` loader entry as a server card. */
    async listMcpServers() {
        const servers = [];
        for (const entry of this.ctx.loader.entries()) {
            // The official bridge's specifier is the package name, not its internal
            // plugin `name` ('mcp-client'); one entry = one MCP server.
            if (entry.options.name !== '@deepseek-ai/dsh-mcp-client')
                continue;
            const cfg = entry.options.config;
            servers.push({
                id: entry.id,
                serverName: cfg?.serverName ?? entry.id,
                transport: cfg?.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
                command: cfg?.command,
                args: cfg?.args,
                cwd: cfg?.cwd,
                url: cfg?.url,
                headers: cfg?.headers,
                disabled: entry.disabled,
                fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
            });
        }
        return servers;
    }
    /** Add one mcp-client entry — hot-connects (create → init) and persists. */
    async createMcpServer(config) {
        const id = `mcp-${config.serverName}`;
        // loader.create's runtime ensureId honors an explicit id (cordis.yml rows
        // all carry one), but its d.ts Omit<EntryOptions,'id'> hides that — assert.
        await this.ctx.loader.create({ id, name: '@deepseek-ai/dsh-mcp-client', config: fullMcpConfig(config) });
        return { id };
    }
    /** Rewrite one server's config — hot-updates the running fiber. */
    async updateMcpServer(id, config) {
        await this.ctx.loader.update(id, { config: fullMcpConfig(config) });
    }
    /** Remove one server — disconnects and unregisters its tools. */
    async removeMcpServer(id) {
        await this.ctx.loader.remove(id);
    }
    /** Enable/disable one server without deleting its config. */
    async setMcpServerEnabled(id, enabled) {
        await this.ctx.loader.update(id, { disabled: enabled ? null : true });
    }
    /** Runtime status per server: upstream `mcpStatus` seam when present, else derived. */
    async mcpStatus() {
        const servers = await this.listMcpServers();
        const seam = this.ctx.get('mcpStatus');
        if (seam !== undefined) {
            const byName = new Map(seam.list().map(s => [s.serverName, s]));
            return servers.map(s => {
                const st = byName.get(s.serverName);
                return {
                    serverName: s.serverName,
                    fiberPhase: s.fiberPhase,
                    toolCount: st?.toolCount ?? 0,
                    connected: st?.phase === 'connected',
                    statusSource: 'seam',
                };
            });
        }
        const toolNames = this.ctx.tools.schemas().map(s => s.name);
        return servers.map(s => {
            const prefix = `mcp__${s.serverName}__`;
            const toolCount = toolNames.filter(n => n.startsWith(prefix)).length;
            return {
                serverName: s.serverName,
                fiberPhase: s.fiberPhase,
                toolCount,
                connected: !s.disabled && s.fiberPhase === 'active' && toolCount > 0,
                statusSource: 'derived',
            };
        });
    }
}
export default SkillMcpService;
