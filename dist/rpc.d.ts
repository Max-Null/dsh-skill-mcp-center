/**
 * `SkillMcpRpc` — a private loopback RPC channel exposing the engine to the
 * browser half (same seam the plugin center uses; the Typert Remote path is
 * closed to third parties).
 */
import { Service, type Context } from '@deepseek-ai/cordis';
export declare class SkillMcpRpc extends Service {
    static inject: string[];
    constructor(ctx: Context);
}
export default SkillMcpRpc;
