/**
 * `SkillMcpRpc` — a private loopback RPC channel exposing the engine to the
 * browser half (same seam the plugin center uses; the Typert Remote path is
 * closed to third parties).
 */
import { Service } from '@deepseek-ai/cordis';
const CHANNEL = '/skill-mcp';
function internal(message) {
    return { ok: false, error: { code: 'internal', message, details: {} } };
}
export class SkillMcpRpc extends Service {
    static inject = ['skillMcp', 'connection'];
    constructor(ctx) {
        super(ctx, 'skillMcpRpc');
        ctx.connection.rpc.handle(CHANNEL, async (endpoint, payload) => {
            try {
                const p = (payload ?? {});
                switch (endpoint) {
                    case 'listSkills': {
                        const cwd = p.cwd;
                        return { ok: true, value: await ctx.skillMcp.listSkills(typeof cwd === 'string' ? cwd : undefined) };
                    }
                    case 'toggleSkill': {
                        const path = p.path;
                        if (typeof path !== 'string' || path === '')
                            return internal('toggleSkill: path is required');
                        return { ok: true, value: await ctx.skillMcp.toggleSkill(path) };
                    }
                    case 'listMcpServers':
                        return { ok: true, value: await ctx.skillMcp.listMcpServers() };
                    case 'createMcpServer':
                        return { ok: true, value: await ctx.skillMcp.createMcpServer(p.config) };
                    case 'updateMcpServer':
                        return { ok: true, value: await ctx.skillMcp.updateMcpServer(String(p.id), p.config) };
                    case 'removeMcpServer':
                        return { ok: true, value: await ctx.skillMcp.removeMcpServer(String(p.id)) };
                    case 'setMcpServerEnabled':
                        return { ok: true, value: await ctx.skillMcp.setMcpServerEnabled(String(p.id), p.enabled === true) };
                    case 'mcpStatus':
                        return { ok: true, value: await ctx.skillMcp.mcpStatus() };
                    default:
                        return internal(`unknown endpoint "${endpoint}"`);
                }
            }
            catch (error) {
                return internal(error instanceof Error ? error.message : String(error));
            }
        }, { authority: 'loopback' });
    }
}
export default SkillMcpRpc;
