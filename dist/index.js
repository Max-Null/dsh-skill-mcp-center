import { SkillMcpService } from "./service.js";
import { SkillMcpRpc } from "./rpc.js";
export { SkillMcpService } from "./service.js";
export const name = 'dsh-skill-mcp-center';
/** The engine declares its own loader/tools dependencies. */
export const inject = ['loader', 'tools'];
export async function apply(ctx) {
    await ctx.plugin(SkillMcpService);
    await ctx.plugin(SkillMcpRpc);
}
