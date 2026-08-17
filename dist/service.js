/**
 * `SkillMcpService` — the process-local composition of skill and MCP
 * management. Skills are read through `ctx.skills` (toggled via the
 * `disable-model-invocation` frontmatter on SKILL.md); MCP servers are the
 * `mcp-client` loader entries, managed hot through `ctx.loader` and observed
 * through a feature-detected `ctx.mcpStatus` seam with a derived fallback.
 */
import { Service } from '@deepseek-ai/cordis';
import { readFile, writeFile } from 'node:fs/promises';
import { setDisableModelInvocation } from "./frontmatter.js";
/** Runtime mirror of cordis FiberState (a cross-package const enum). */
const FIBER_PHASE = {
    0: 'pending',
    1: 'loading',
    2: 'active',
    3: 'failed',
    4: null,
    5: 'unloading',
};
/** Bundled and runtime skills have no writable SKILL.md; the rest are toggleable. */
function isWritableSource(source) {
    return source !== 'bundled' && source !== 'runtime';
}
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
export class SkillMcpService extends Service {
    static inject = ['skills', 'loader', 'tools'];
    constructor(ctx) {
        super(ctx, 'skillMcp');
    }
    /** All skills the deployment sees, with resolved invocation + writable flag. */
    async listSkills() {
        const skills = await this.ctx.skills.list();
        return skills.map(s => ({
            name: s.name,
            description: s.description,
            source: s.source,
            provider: s.provider,
            modelInvocable: s.invocation.modelInvocable,
            userInvocable: s.invocation.userInvocable,
            writable: isWritableSource(s.source),
        }));
    }
    /** Flip one disk-backed skill's model invocation by rewriting its SKILL.md frontmatter. */
    async toggleSkill(name) {
        const skill = await this.ctx.skills.get(name);
        if (skill === undefined)
            throw new Error('skill-not-found');
        if (!isWritableSource(skill.source) || skill.path === undefined)
            throw new Error('skill-readonly');
        const text = await readFile(skill.path, 'utf8');
        // Currently model-invocable → disable; the watcher invalidates the catalog.
        await writeFile(skill.path, setDisableModelInvocation(text, skill.invocation.modelInvocable), 'utf8');
        return {
            name: skill.name,
            description: skill.description,
            source: skill.source,
            provider: skill.provider,
            modelInvocable: !skill.invocation.modelInvocable,
            userInvocable: skill.invocation.userInvocable,
            writable: true,
        };
    }
    /** Every `mcp-client` loader entry as a server card. */
    async listMcpServers() {
        const servers = [];
        for (const entry of this.ctx.loader.entries()) {
            if (entry.options.name !== 'mcp-client')
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
        await this.ctx.loader.create({ id, name: 'mcp-client', config: fullMcpConfig(config) });
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
        const seam = this.ctx.mcpStatus;
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
